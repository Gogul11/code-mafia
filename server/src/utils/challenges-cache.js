import supabase from "../config/db.js";
import client from "../config/redisdb.js";

/**
 * Fetches all challenges from Supabase and caches them for both 'user' and 'judge0'.
 */
async function getAndCacheChallenge() {
    const { data, error } = await supabase
        .from('challenges')
        .select('*');

    if (error) {
        console.error('Supabase error:', error);
        throw error;
    }

    // Cache for both 'user' and 'judge0' types
    const userCacheKey = 'challenges-user';
    const judge0CacheKey = 'challenges-judge0';

    // Cache data preparation for both cases
    const userCacheData = data.map(challenge => {
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

    // Cache the full list for judge0 (no filtering)
    const judge0CacheData = data;

    // Set both caches simultaneously
    await Promise.all([
        client.set(userCacheKey, JSON.stringify(userCacheData), {
            EX: 60 * 60 * 3.5 // Cache for 3.5 hours
        }),
        client.set(judge0CacheKey, JSON.stringify(judge0CacheData), {
            EX: 60 * 60 * 3.5 // Cache for 3.5 hours
        })
    ]);

    console.log('Cached challenges for both user and judge0');
}

export default getAndCacheChallenge;