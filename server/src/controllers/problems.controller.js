import client from '../config/redisdb.js';
import getAndCacheChallenge from '../utils/challenges-cache.js';

export const getProblem = async (req, res) => {
  try {
    let cachedData = await client.get('challenges-user');

    if (!cachedData) {
      await getAndCacheChallenge();
      cachedData = await client.get('challenges-user');
    }
    return res.status(200).json({ qs: JSON.parse(cachedData) });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ err: "Server error" });
  }
};
