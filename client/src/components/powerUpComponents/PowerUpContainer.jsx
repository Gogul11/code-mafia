import React, { useState, useEffect } from "react";
import axios from "axios";
import socket from "../../socket.js";

function PowerUpContainer() {
    const [powers, setPowers] = useState([
        { id: 1, name: "upside-down", description: "", effect: "upside-down" },
        { id: 2, name: "blind", description: "", effect: "blind" }
    ]);
    const [teams, setTeams] = useState([]);
    const [clicked, setClicked] = useState(false);
    const [username, setUsername] = useState("Anonymous user");
    const [inputValue, setInputValue] = useState("");
    const [clickedPower, setClickedPower] = useState("");
    const [clickedTeam, setClickedTeam] = useState(null);

    function handleClickPower(e) {
        setClickedPower(e.target.value);
        setClicked(true);
    }

    function handleUsernameChange(e) {
        setInputValue(e.target.value);
    }

    function onUsernameSelection(username) {
        socket.auth = { username };
        socket.connect();
    }

    function handleUsernameSubmit() {
        setUsername(inputValue);
        onUsernameSelection(inputValue);
    }

    function handleClose() {
        setClicked(false);
    }

    function handleTeamClick(team) {
        setClickedTeam(team);
    }

    function handleApply() {
        if (!clickedPower || !clickedTeam) {
            alert("Please select a power and a team.");
            return;
        }
        
        socket.emit("power-up attack", {
            powerUp: clickedPower,
            targetUserID: clickedTeam.userID,
            from: username
        });

        alert(`You used ${clickedPower} on ${clickedTeam.username}`);
        setClickedPower("");
        setClickedTeam(null);
    }

    useEffect(() => {
        async function getPowerUps() {
            try {
                const response = await axios.get(process.env.REACT_APP_SERVER_BASEAPI + "/game/getpowers");
                console.log("data", response.data.data);
                if (response.data) setPowers(response.data.data);
            } catch (error) {
                console.error(error);
            }
        }
        
        getPowerUps();

        socket.on("users", (users) => {
            users.forEach((user) => {
                user.isCurrentUser = user.userID === socket.id;
            });
            setTeams(users);
        });

        socket.on("receive power-up", ({ powerUp, from }) => {
            alert(`You were attacked with ${powerUp} by ${from}!`);
        });


        return () => {
            socket.off("users");
            socket.off("receive power-up");
        };
    }, []);

    return (
        <>
            {username === "Anonymous user" ? (
                <div id="username-input">
                    <input type="text" value={inputValue} onChange={handleUsernameChange} />
                    <button onClick={handleUsernameSubmit}>Next</button>
                </div>
            ) : (
                <div id="power-page">
                    <div id="powerup-container">
                        {powers.map((power) => (
                            <button key={power.id} onClick={handleClickPower} value={power.effect}>
                                {power.name}
                            </button>
                        ))}
                    </div>

                    {clicked && (
                        <div id="teams-container">
                            <ul id="teams-list">
                                {teams
                                    .filter((team) => !team.isCurrentUser)
                                    .map((team) => (
                                        <li key={team.userID}>
                                            <button onClick={() => handleTeamClick(team)}>{team.username}</button>
                                        </li>
                                    ))}
                            </ul>
                            <button onClick={handleApply}>Apply</button>
                            <button onClick={handleClose}>Close</button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default PowerUpContainer;
