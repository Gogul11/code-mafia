import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Leaderboard.css";
import Navbar from "./Navbar";

const LeaderBoard = () => {
    const [ten, setTen] = useState(0);
    const [allLeaders, setAllLeaders] = useState([]);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_BASEAPI}/leader`, {withCredentials: true});
                setAllLeaders(response.data.data);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
        };

        fetchLeaders();
    }, []);

    const getMedal = (index) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return null;
    };

    const handlePrev = () => {
        if (ten > 0) setTen(ten - 10);
    };

    const handleNext = () => {
        if (ten + 10 < allLeaders.length) setTen(ten + 10);
    };

    const leaders = allLeaders.slice(ten, ten + 10);

    return (
        <div className="leaderboard-wrapper">
            <Navbar />
            <div className="leaderboard-container">
                <h1 className="leaderboard-title">Leaderboard</h1>
                <div className="leaderboard-table-wrapper">
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Team</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaders.map((leader, index) => (
                                <tr key={leader.team_id}>
                                    <td className="rank-cell">
                                        <span className="medal">{getMedal(ten + index)}</span>
                                        <span>{ten + index + 1}</span>
                                    </td>
                                    <td>{leader.name}</td>
                                    <td>{leader.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="leaderboard-buttons">
                    <button onClick={handlePrev} disabled={ten === 0}>
                        Previous
                    </button>
                    <button onClick={handleNext} disabled={ten + 10 >= allLeaders.length}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeaderBoard;
