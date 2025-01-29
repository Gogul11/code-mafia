import supabase from '../config/db.js';


export const getProblem = async(req,res) => {
    const { data, error } = await supabase.from("challenges").select("*");

  if (error) {
    console.error("Error fetching challenges:", error);
    return res.json({err : error});
  }

  return res.status(200).json({qs : data})
}


