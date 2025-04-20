// import supabase from "../config/db.js";
// import client from "../config/redisdb.js";

// export const getLeader = async() => {
//     const {data, error} = await supabase.from("teams").select("*")

//     if (error) {
//         console.error("Error fetching challenges:", error);
//         return res.json({err : error});
//     }

//     const sorted = data.sort((a, b) => b.points - a.points);

//     await client.set("leaderboard", JSON.stringify(sorted))
//     console.log("Data updated in the redis")
// }

// // const fetchLeader = () => {
// //     setInterval(getLeader, 5000)
// // }

// export const getLeaderboardFromRedis = async (req, res) => {
//     const cached = await client.get("leaderboard");

//     if (!cached) return res.status(200).json({ error: "Leaderboard not cached" });

//     return res.status(200).json({ data: JSON.parse(cached) });
// };


import supabase from "../config/db.js";
import client from "../config/redisdb.js";

export const getLeader = async () => {
    try {
        const { data, error } = await supabase.from("teams").select("*");

        if (error) {
            console.error("Error fetching challenges:", error);
            throw new Error("Failed to fetch leaderboard");
        }

        const sorted = data.sort((a, b) => b.points - a.points);

        await client.set("leaderboard", JSON.stringify(sorted));
     
        
        return sorted; 
    } catch (err) {
        console.error("Error in getLeader:", err.message);
        throw err; 
    }
};


export const getLeaderboardFromRedis = async (req, res) => {
    try {
        const cached = await client.get("leaderboard");

        if (!cached) {
            return res.status(200).json({ error: "Leaderboard not cached" });
        }

        return res.status(200).json({ data: JSON.parse(cached) });
    } catch (err) {
        console.error("Error fetching from Redis:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};