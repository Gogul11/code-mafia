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
