import "dotenv/config";
import supabase from "../config/db.js";
import jwt from "jsonwebtoken";

export const getPowers = async(req,res) => {
    const { data, error } = await supabase.from("power_ups").select("*");

  if (error) {
    console.error("Error fetching power ups:", error);
    return res.json({err : error});
  }

  return res.status(200).json({data : data});
}

export const getCoins = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const teamID = decoded.team_id;

    if (!teamID) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const { data, error } = await supabase
      .from("teams")
      .select("coins")
      .eq("id", teamID)
      .single();

    if (error) {
      console.error("Error fetching coins:", error);
      return res.status(500).json({ error: "Failed to fetch coins" });
    }

    return res.status(200).json({ coins: data.coins });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
