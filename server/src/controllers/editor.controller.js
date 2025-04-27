import "dotenv/config";
import supabase from "../config/db.js";
import axios from 'axios';
import { Buffer } from 'buffer';
import getAndCacheChallenge from "../utils/challenges-cache.js";
import localCache from '../utils/challenges-cache.js';

export async function runBatchCode(req, res, next) {
    try {
        const { question_id, language_id, source_code } = req.body;

        if (!validateRequest(question_id)) {
            return res.status(400).json({ error: "Invalid question_id" });
        }

        const challenge = await fetchChallenge(question_id, "user");
        if (!challenge) {
            return res.status(404).json({ error: "Challenge not found" });
        }

        const testCases = extractTestCases(challenge);
        const submissions = encodeSubmissions(testCases, language_id, source_code);

        const submissionTokens = await submitToJudge0(submissions);
        const finalResponse = await pollJudge0(submissionTokens);

        const results = decodeResults(finalResponse, testCases);
        const passed = results.filter(r => r.isCorrect).length;


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

export async function submitCodeForQuestion(req, res, next) {
    try {
        const { question_id, language_id, source_code } = req.body;

        const team_id = req.user.team_id;

        if (!validateRequest(question_id)) {
            return res.status(400).json({ error: "Invalid question_id" });
        }

        const challenge = await fetchChallenge(question_id, "judge0");
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
        console.error("Error in submit code:", error);
        next(error);
    }
}

export async function getPoints(req, res, next) {
    try {
        const team_id = req.user.team_id;
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
export async function fetchChallenge(question_id, type) {
    const cacheKey = `challenges-${type}`;

    let cachedData = localCache.get('challenges-user');

    // If cache doesn't exist, fetch and cache both user and judge0 challenges
    if (!cachedData) {
        await getAndCacheChallenge();
        cachedData = localCache.get('challenges-user');

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
        type: tc.type?.toString() ?? "",
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
        const isHidden = testCase.type === 'hidden';
        console.log(testCase);
        const isCorrect = sub.status.id === 3 && decodedOutput.trim() === decodedExpectedOutput.trim();

        return {
            testCase: testCase.name,
            status: sub.status.description,
            input: isHidden ? 'hidden' : testCase.input,
            output: isHidden ? 'hidden' : decodedOutput,
            expectedOutput: isHidden ? 'hidden' : decodedExpectedOutput,
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

    let coins;
    if (challenge.points === 10) {
        coins = 5;
    } else if (challenge.points === 20) {
        coins = 7;
    } else if (challenge.points === 30) {
        coins = 10;
    } else {
        coins = 0;
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
            updatedFields.coins = teamData.coins + coins;
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
