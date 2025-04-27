import { localCache } from '../utils/challenges-cache.js';
import supabase from '../config/db.js';
import getAndCacheChallenge from '../utils/challenges-cache.js';

export const getProblem = async (req, res) => {
  try {
    let cachedData = localCache.get('challenges-user');

    if (!cachedData) {
      await getAndCacheChallenge();
      cachedData = localCache.get('challenges-user');
    }
    
    return res.status(200).json({ qs: cachedData });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ err: "Server error" });
  }
};

export const getChallengesSolvedStatus = async (req, res) => {
  try {
    const team_id = req.user.team_id;
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('challenge_id, status, code')
      .eq('team_id', team_id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    const statusMap = {};
    submissions.forEach(sub => {
      if (!statusMap[sub.challenge_id]) {
        statusMap[sub.challenge_id] = {
          status: sub.status,
          code: sub.code
        };
      }
    });

    return res.status(200).json(statusMap);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};