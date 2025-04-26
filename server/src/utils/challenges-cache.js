import supabase from "../config/db.js";
import client from "../config/redisdb.js";
import { promises as fs } from 'fs';
import path from "path";import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getAndCacheChallenge() {
    const { data, error } = await supabase
        .from('challenges')
        .select('*');

    if (error) {
        console.error('Supabase error:', error);
        throw error;
    }

    // Helper function to read file and format it (replace newlines with \n)
    async function readFileContent(fileName) {
        const filePath = path.resolve(__dirname, '../../large_test_cases', fileName);
        const content = await fs.readFile(filePath, 'utf8');
        return content.replace(/\r?\n/g, '\n'); // Replace newlines with \n
    }

    // Before caching, replace file-based test cases
    const processedData = await Promise.all(data.map(async (challenge) => {
        const newTestCases = {};

        for (const [key, testCase] of Object.entries(challenge.test_cases)) {
            const updatedTestCase = { ...testCase };

            if (testCase.input_file) {
                updatedTestCase.input = await readFileContent(testCase.input_file);
                delete updatedTestCase.input_file;
            }

            if (testCase.expected_output_file) {
                updatedTestCase.expected_output = await readFileContent(testCase.expected_output_file);
                delete updatedTestCase.expected_output_file;
            }

            newTestCases[key] = updatedTestCase;
        }

        return {
            ...challenge,
            test_cases: newTestCases
        };
    }));

    // Cache for user (filtered)
    const userCacheKey = 'challenges-user';
    const judge0CacheKey = 'challenges-judge0';

    const userCacheData = processedData.map(challenge => {
        const filteredTestCases = Object.fromEntries(
            Object.entries(challenge.test_cases).filter(
                ([, value]) => value.type !== 'hidden'
            )
        );
        return {
            ...challenge,
            test_cases: filteredTestCases
        };
    });

    const judge0CacheData = processedData;
    console.log(judge0CacheData[5].test_cases.test_case_7);

    await Promise.all([
        client.set(userCacheKey, JSON.stringify(userCacheData), {
            EX: 60 * 60 * 3.5
        }),
        client.set(judge0CacheKey, JSON.stringify(judge0CacheData), {
            EX: 60 * 60 * 3.5
        })
    ]);

    console.log('Cached challenges for both user and judge0');
}

export default getAndCacheChallenge;
