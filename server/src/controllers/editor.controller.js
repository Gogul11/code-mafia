import "dotenv/config";
import supabase from "../config/db.js";
import axios from 'axios';

export async function runCode(req, res, next) {
    try {
        console.log(req.body);
        const header = {
            "Content-Type": "application/json",
            "X-Auth-Token": process.env.X_AUTH_TOKEN,
        };
        const body = {
            "source_code": req.body.source_code || "",
            "language_id": req.body.language_id || 71,
            "stdin": req.body.stdin || "",
            "expected_output": req.body.expected_output || "",
        };
        const response = await axios.post(process.env.JUDGE_ZERO_API + "/submissions/", body, { header });
        const submission_token = response.data.token;
    
        try {

            let response;
            do {
                response = await axios.get(process.env.JUDGE_ZERO_API + "/submissions/" + submission_token);
            }while(response.data.status.id <= 2);
            console.log(response.data);

            res.status(200).json({  "stdout": response.data.stdout, 
                                    "stderr": response.data.stderr, 
                                    "description": response.data.status.description,
                                    "compile_output": response.data.compile_output, 
            });

        } catch (error) {
            console.log(error);
            next(error);
        }
    } catch (e) {
        console.log(e);
        next(e);
    }
}

export async function runBatchCode(req, res, next) {
    try {
        console.log("Step 1: Extracting request body");
        const { question_id, language_id, source_code } = req.body; 
        console.log("Received data:", req.body);
        if (!question_id || typeof question_id !== "number") {
            return res.status(400).json({ error: "Invalid question_id" });
        }
        
        console.log("Step 2: Fetching the challenge from Supabase");
        const { data: challenge, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('id', question_id)
            .single();

        if (error) {
            console.error("Error fetching challenge:", error);
            throw error;
        }
        if (!challenge) {
            console.log("Challenge not found");
            return res.status(404).json({ error: "Challenge not found" });
        }
        console.log("Fetched challenge:", challenge);

        console.log("Step 3: Extracting test cases from challenge");
        const testCases = Object.entries(challenge.test_cases).map(([name, tc]) => ({
            name,
            input: tc.input,
            expected_output: tc.expected_output.toString() // Ensure string comparison
        }));
        console.log("Extracted test cases:", testCases);

        console.log("Step 4: Preparing Judge0 submissions");
        const submissions = testCases.map(testCase => ({
            source_code,
            language_id,
            stdin: testCase.input,
            expected_output: testCase.expected_output
        }));
        console.log("Prepared submissions:", submissions);

        console.log("Step 5: Submitting to Judge0");
        const judge0Header = {
            "Content-Type": "application/json",
            "X-Auth-Token": process.env.X_AUTH_TOKEN,
        };

        const initialResponse = await axios.post(
            process.env.JUDGE_ZERO_API + "/submissions/batch",
            { submissions },
            { headers: judge0Header }
        );
        console.log("Initial response from Judge0:", initialResponse.data);

        console.log("Step 6: Extracting submission tokens");
        const submissionTokens = initialResponse.data.map(sub => sub.token).join(',');
        console.log("Submission tokens:", submissionTokens);

        console.log("Step 7: Polling for results with timeout");
        const startTime = Date.now();
        const timeout = 10000; // 10 seconds
        let finalResponse;

        while (true) {
            if (Date.now() - startTime > timeout) {
                console.error("Judge0 timeout exceeded");
                throw new Error("Judge0 timeout exceeded");
            }

            finalResponse = await axios.get(
                `${process.env.JUDGE_ZERO_API}/submissions/batch?tokens=${submissionTokens}&fields=*`,
                { headers: judge0Header }
            );
            console.log("Polling response:", finalResponse.data);

            const allCompleted = finalResponse.data.submissions.every(
                sub => sub.status_id > 2
            );

            if (allCompleted) {
                console.log("All submissions completed");
                break;
            }
            
            console.log("Not all submissions completed, retrying...");
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log("Step 8: Formatting response");
        const results = finalResponse.data.submissions.map((sub, index) => {
            const testCase = testCases[index];
            const isCorrect = sub.status.id === 3 && 
                            sub.stdout.trim() === testCase.expected_output.trim();
            
            return {
                testCase: testCase.name,
                status: sub.status.description,
                input: testCase.input,
                output: sub.stdout || sub.stderr,
                expectedOutput: testCase.expected_output,
                isCorrect,
                runtime: sub.time ? `${sub.time}s` : 'N/A'
            };
        });
        console.log("Formatted results:", results);

        const passed = finalResponse.data.submissions.filter(sub => 
            sub.status.id === 3 && 
            sub.stdout.trim() === testCases.find(tc => 
                tc.name === `test_case_${finalResponse.data.submissions.indexOf(sub)+1}`
            ).expected_output.trim()
        ).length;

        console.log(`Passed: ${passed}, Total: ${testCases.length}`);

        res.status(200).json({
            challengeId: challenge.id,
            title: challenge.title,
            results,
            passed,
            total: testCases.length
        });

    } catch (error) {
        console.error("Error in runBatchCode:", error);
        next(error);
    }
}