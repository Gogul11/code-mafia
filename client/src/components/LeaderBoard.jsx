import React, { useEffect, useState } from "react";
import axios from "axios";
const sampleLeaders = [
    { id: 1, teamName: "Team Alpha", score: 95 },
    { id: 2, teamName: "Team Beta", score: 90 },
    { id: 3, teamName: "Team Gamma", score: 85 },
    { id: 4, teamName: "Team Delta", score: 80 },
    { id: 5, teamName: "Team Epsilon", score: 75 },
    { id: 6, teamName: "Team Zeta", score: 70 },
    { id: 7, teamName: "Team Eta", score: 65 },
    { id: 8, teamName: "Team Theta", score: 60 },
    { id: 9, teamName: "Team Iota", score: 55 },
    { id: 10, teamName: "Team Kappa", score: 50 },
];
const LeaderBoard = () => {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        // Fetch leaderboard data from the backend
        const fetchLeaders = async () => {
            // try {
            //     const response = await axios.get("/api/leaderboard"); // Replace with your backend endpoint
            //     setLeaders(response.data.slice(0, 10)); // Get top 10 teams
            // } catch (error) {
            //     console.error("Error fetching leaderboard data:", error);
            // }
            setLeaders(sampleLeaders); // Use sample data for testing
        };

        fetchLeaders();
    }, []);

    const getMedal = (index) => {
        if (index === 0) return "🥇"; // Gold medal
        if (index === 1) return "🥈"; // Silver medal
        if (index === 2) return "🥉"; // Bronze medal
        return null;
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h1
                style={{
                    fontSize: "4rem",
                    position: "relative",
                    color: "#FFD400",
                    textShadow: "2px 2px #ff0000, -2px -2px #0000ff",
                    animation: "glitch 1s infinite",
                }}
            >
                Leaderboard
            </h1>
            <table style={{ margin: "0 auto", borderCollapse: "collapse", width: "80%" }}>
                <thead>
                    <tr>
                        <th
                            style={{
                                padding: "1vw",
                                fontSize: "2rem",
                                color: "#FFD400",
                                textShadow: "2px 2px #ff0000, -2px -2px #0000ff",
                                animation: "glitch 1s infinite",
                            }}
                        >
                            Rank
                        </th>
                        <th
                            style={{
                                padding: "1vw",
                                fontSize: "2rem",
                                color: "#FFD400",
                                textShadow: "2px 2px #ff0000, -2px -2px #0000ff",
                                animation: "glitch 1s infinite",
                            }}
                        >
                            Team
                        </th>
                        <th
                            style={{
                                padding: "1vw",
                                fontSize: "2rem",
                                color: "#FFD400",
                                textShadow: "2px 2px #ff0000, -2px -2px #0000ff",
                                animation: "glitch 1s infinite",
                            }}
                        >
                            Score
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {leaders.map((leader, index) => (
                        <tr key={leader.id} style={{ height: "40px" }}>
                            <td
                                style={{
                                    padding: "1vw",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "1vw",
                                    fontSize: "2vh",
                                    color: "#FFD400",
                                }}
                            >
                                <span>{getMedal(index)}</span>
                                <span>{index + 1}</span>
                            </td>
                            <td style={{ padding: "1vw", fontSize: "2vh", color: "#FFD400" }}>{leader.teamName}</td>
                            <td style={{ padding: "1vw", fontSize: "2vh", color: "#FFD400" }}>{leader.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style>
                {`
                    @keyframes glitch {
                        0% {
                            text-shadow: 2px 2px #ff0000, -2px -2px #0000ff;
                        }
                        25% {
                            text-shadow: 2px -2px #ff0000, -2px 2px #0000ff;
                        }
                        50% {
                            text-shadow: -2px 2px #ff0000, 2px -2px #0000ff;
                        }
                        75% {
                            text-shadow: -2px -2px #ff0000, 2px 2px #0000ff;
                        }
                        100% {
                            text-shadow: 2px 2px #ff0000, -2px -2px #0000ff;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default LeaderBoard;