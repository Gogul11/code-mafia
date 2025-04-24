import "dotenv/config";
import supabase from "../config/db.js";
import axios from 'axios';
import { Buffer } from 'buffer';
import jwt from 'jsonwebtoken';
import client from '../config/redisdb.js';
import getAndCacheChallenge from "../utils/challenges-cache.js";

export async function runCode(req, res, next) {
    try {
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
            } while (response.data.status.id <= 2);
            res.status(200).json({
                "stdout": response.data.stdout,
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
        const { question_id, language_id, source_code } = req.body;
        const token = req.headers.authorization?.split(" ")[1];

        // Verify and decode the token using the JWT secret from environment variables
        let team_id;

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            team_id = decoded.team_id;
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!team_id) {
            return res.status(400).json({ error: "Team_id not found in token" });
        }

        if (!validateRequest(question_id)) {
            return res.status(400).json({ error: "Invalid question_id" });
        }

        const challenge = await fetchChallenge(question_id);
        if (!challenge) {
            return res.status(404).json({ error: "Challenge not found" });
        }

        const testCases = extractTestCases(challenge);
        const submissions = encodeSubmissions(testCases, language_id, source_code);

        const submissionTokens = await submitToJudge0(submissions);
        const finalResponse = await pollJudge0(submissionTokens);

        const results = decodeResults(finalResponse, testCases);
        const passed = results.filter(r => r.isCorrect).length;

        

        await storeSubmission({
            team_id: team_id, 
            question_id,
            challenge,
            source_code,
            passed,
            total: testCases.length
        });

        return res.status(200).json({
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

export async function getPoints(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Authorization token is required" });
        }

        let team_id;
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            team_id = decoded.team_id;
        } catch (err) {
            return res.status(400).json({ error: "Invalid token" });
        }

        if (!team_id) {
            return res.status(400).json({ error: "Team_id not found in token" });
        }

        const { data: team, error } = await supabase
            .from("teams")
            .select("points")
            .eq("id", team_id)
            .single();

        if (error) {
            throw error;
        }

        return res.status(200).json({ team_id, points: team.points });
    } catch (error) {
        console.error("Error in getPoints:", error);
        next(error);
    }
}


// Helper Functions
function validateRequest(question_id) {
    return question_id && typeof question_id === "number";
}

/**
 * Fetches a challenge from cache. Falls back to DB if cache is not present.
 * @param {string} question_id 
 * @param {'user' | 'judge0'} type 
 * @returns {Promise<Object>} Challenge data
 */
export async function fetchChallenge(question_id, type = 'user') {
    const cacheKey = `challenges-${type}`;

    let cachedData = await client.get(cacheKey);

    // If cache doesn't exist, fetch and cache both user and judge0 challenges
    if (!cachedData) {
        await getAndCacheChallenge();
        cachedData = await client.get(cacheKey);
    }

    const parsed = JSON.parse(cachedData);
    const challenge = parsed.find(ch => ch.id === question_id);

    if (!challenge) {
        throw new Error(`Challenge with id ${question_id} not found in ${type} cache`);
    }

    return challenge;
}

function extractTestCases(challenge) {
    return Object.entries(challenge.test_cases).map(([name, tc]) => ({
        name,
        input: tc.input?.toString() ?? "",
        expected_output: tc.expected_output?.toString() ?? ""
    }));
}

function encodeSubmissions(testCases, language_id, source_code) {
    return testCases.map(tc => ({
        source_code: Buffer.from(source_code, 'utf-8').toString('base64'),
        language_id,
        stdin: Buffer.from(tc.input, 'utf-8').toString('base64'),
        expected_output: Buffer.from(tc.expected_output, 'utf-8').toString('base64')
    }));
}

async function submitToJudge0(submissions) {
    const judge0Header = {
        "Content-Type": "application/json",
        "X-Auth-Token": process.env.X_AUTH_TOKEN,
    };

    const { data } = await axios.post(
        `${process.env.JUDGE_ZERO_API}/submissions/batch?base64_encoded=true`,
        { submissions },
        { headers: judge0Header }
    );

    return data.map(sub => sub.token).join(',');
}

async function pollJudge0(tokens) {
    const judge0Header = {
        "Content-Type": "application/json",
        "X-Auth-Token": process.env.X_AUTH_TOKEN,
    };

    const startTime = Date.now();
    const timeout = 10000;

    while (true) {
        if (Date.now() - startTime > timeout) {
            throw new Error("Judge0 request timeout");
        }

        const { data } = await axios.get(
            `${process.env.JUDGE_ZERO_API}/submissions/batch?tokens=${tokens}&fields=*&base64_encoded=true`,
            { headers: judge0Header }
        );

        const allCompleted = data.submissions.every(sub => sub.status.id > 2);
        if (allCompleted) return data;

        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

function decodeResults(response, testCases) {
    return response.submissions.map((sub, index) => {
        const testCase = testCases[index];
        const decodedOutput = sub.stdout ? Buffer.from(sub.stdout, 'base64').toString('utf-8') : null;
        const decodedExpectedOutput = Buffer.from(testCase.expected_output, 'utf-8').toString('utf-8');
        const isCorrect = sub.status.id === 3 && decodedOutput.trim() === decodedExpectedOutput.trim();

        return {
            testCase: testCase.name,
            status: sub.status.description,
            input: testCase.input,
            output: decodedOutput,
            expectedOutput: decodedExpectedOutput,
            isCorrect,
            runtime: sub.time ? `${sub.time}s` : 'N/A'
        };
    });
}

async function storeSubmission({ team_id, question_id, challenge, source_code, passed, total }) {
    let status;
    if (passed === 0) {
        status = "Incomplete";
    } else if (passed < total) {
        status = "Partial";
    } else {
        status = "Accepted";
    }

    const points_awarded = Math.round((passed / total) * challenge.points);

    const { data: existing, error: fetchError } = await supabase
        .from("submissions")
        .select("id, points_awarded")
        .eq("team_id", team_id)
        .eq("challenge_id", question_id)
        .maybeSingle();

    if (fetchError) throw fetchError;

    if (!existing) {
        // Insert new submission
        const { error: insertError } = await supabase
            .from("submissions")
            .insert([{
                team_id,
                challenge_id: question_id,
                code: source_code,
                status,
                points_awarded
            }]);

        if (insertError) throw insertError;

        // Fetch current team score and coins
        const { data: teamData, error: teamFetchError } = await supabase
            .from("teams")
            .select("points, coins")
            .eq("id", team_id)
            .single();

        if (teamFetchError) throw teamFetchError;

        const newScore = teamData.points + points_awarded;
        let updatedFields = { points: newScore };

        // Award 5 coins if fully passed
        if (passed === total) {
            updatedFields.coins = teamData.coins + 5;
        }

        // Update team points and maybe coins
        const { error: teamUpdateError } = await supabase
            .from("teams")
            .update(updatedFields)
            .eq("id", team_id);

        if (teamUpdateError) throw teamUpdateError;

    } else if (points_awarded >= existing.points_awarded) {
        const scoreDiff = points_awarded - existing.points_awarded;

        // Update submission
        const { error: updateError } = await supabase
            .from("submissions")
            .update({
                code: source_code,
                status,
                points_awarded
            })
            .eq("id", existing.id);

        if (updateError) throw updateError;

        // Fetch current team point
        const { data: teamData, error: teamFetchError } = await supabase
            .from("teams")
            .select("points, coins")
            .eq("id", team_id)
            .single();

        if (teamFetchError) throw teamFetchError;

        const newScore = teamData.points + scoreDiff;

        let updatedFields = { points: newScore };
        // Award 5 coins if fully passed for the first time
        if (existing.points_awarded !== challenge.points && passed === total) {
            updatedFields.coins = teamData.coins + 5;
        }

        // Update team point
        const { error: teamUpdateError } = await supabase
            .from("teams")
            .update(updatedFields)
            .eq("id", team_id);

        if (teamUpdateError) throw teamUpdateError;
    }
}
