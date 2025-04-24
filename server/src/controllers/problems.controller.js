import client from '../config/redisdb.js';
import supabase from '../config/db.js';
import getAndCacheChallenge from '../utils/challenges-cache.js';
import jwt from 'jsonwebtoken';

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

export const getChallengesSolvedStatus = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    let team_id;
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      team_id = decoded.team_id;
      
      if (!team_id) {
        return res.status(401).json({ error: "Unauthorized - Invalid token content" });
      }
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }

    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('challenge_id, status')
      .eq('team_id', team_id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    const statusMap = {};
    submissions.forEach(sub => {
      if (!statusMap[sub.challenge_id]) {
        statusMap[sub.challenge_id] = sub.status;
      }
    });

    return res.status(200).json(statusMap);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
