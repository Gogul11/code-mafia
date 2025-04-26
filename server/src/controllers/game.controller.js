import "dotenv/config";
import supabase from "../config/db.js";

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
    const teamID = req.user.team_id;
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
