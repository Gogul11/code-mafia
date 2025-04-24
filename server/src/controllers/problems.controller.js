import supabase from '../config/db.js';
import client from '../config/redisdb.js';

export const getProblem = async (req, res) => {
    try {
        // Check Redis cache first
        const cachedData = await client.get('challenges-user');

        if (cachedData) {
            console.log('Serving from user cache');
            return res.status(200).json({ qs: JSON.parse(cachedData) });
        }

        // If not in cache, fetch from Supabase
        const { data, error } = await supabase.from("challenges").select("*");

        if (error) {
            console.error("Error fetching challenges:", error);
            return res.status(500).json({ err: error });
        }

        // Remove hidden test cases
        const sanitizedData = data.map(challenge => {
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

        // Save sanitized data to Redis (cache for 3.5 hours)
        await client.set('challenges-user', JSON.stringify(sanitizedData), {
            EX: 60 * 60 * 3.5
        });

        console.log('Serving sanitized data from Supabase and caching result');
        return res.status(200).json({ qs: sanitizedData });
    } catch (err) {
        console.error("Unexpected error:", err);
        return res.status(500).json({ err: "Server error" });
    }
};
