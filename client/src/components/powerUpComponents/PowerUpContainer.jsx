import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../../socket.js";

function PowerUpContainer() {
    const [powers, setPowers] = useState([
        { id: 1, name: "Situs Inversus", description: "", effect: "flip" },
        { id: 2, name: "Smoke Screen", description: "", effect: "blind" },
        { id: 3, name: "The Wall Breaker", description: "", effect: "wall-breaker" },
        { id: 4, name: "Zip Bomb", description: "", effect: "zip-bomb" },
        { id: 5, name: "The Suicide Bomber", description: "", effect: "suicide-bomber" },
        { id: 6, name: "WindMill", description: "", effect: "windmill" },
        { id: 7, name: "System Overload", description: "", effect: "glitch" },
        { id: 8, name: "Innocency", description: "", effect: "innocency" },
        { id: 9, name: "Zero Kelvin", description: "", effect: "freeze" },
    ]);
    const [teams, setTeams] = useState([]);
    const [clicked, setClicked] = useState(false);
    const [username, setUsername] = useState("Anonymous user");
    const [inputValue, setInputValue] = useState("");
    const [clickedPower, setClickedPower] = useState("");
    const [clickedTeam, setClickedTeam] = useState(null);

    const angleRef = useRef(0);
    const requestRef = useRef(null);
    const [isRotating, setIsRotating] = useState(false);
    const overlayRef = useRef(null);

    const [popup, setPopup] = useState(false);
    const [popupCount, setPopupCount] = useState(0)
    const popupRef = useRef(null);

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

    function handlePopupClose(e) {
        if (popupCount < 20) {
            const randomTop = Math.floor((Math.random() * 200) - 50);
            const randomLeft = Math.floor((Math.random() * 200) - 100);
            setPopupCount((count) => count + 1);
            popupRef.current.style.top = `${randomTop}px`;
            popupRef.current.style.left = `${randomLeft}px`;
        } else {
            setPopupCount(0);
            setPopup(false);
        }
    }

    function executePowerUp(effect) {
        if (effect === "windmill") {
            setIsRotating(true);
        }
        else if (effect === "flip") {
            document.body.classList.add("flip");
            setTimeout(() => { document.body.classList.remove("flip") }, 1000 * 60);
        }
        else if (effect === "freeze") {
            overlayRef.current.classList.add("overlay");
            setTimeout(() => { overlayRef.current.classList.remove("overlay") }, 1000 * 60);
        }
        else if (effect === "glitch") {
            setPopup(true);
        }
        else if (effect === "blind") {
            document.body.classList.add("foggy");
            setTimeout(() => { document.body.classList.remove("foggy") }, 1000 * 60);
        }
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
        if (isRotating) {
            const rotate = () => {
                angleRef.current += 1; // Adjust for speed
                document.body.style.transform = `rotate(${angleRef.current}deg)`;
                document.body.style.transformOrigin = "50% 50%";
                requestRef.current = requestAnimationFrame(rotate);
            };

            requestRef.current = requestAnimationFrame(rotate);

            const timer = setTimeout(() => {
                setIsRotating(false);
            }, 1000 * 60);

            return () => {
                cancelAnimationFrame(requestRef.current);
                clearTimeout(timer);
                document.body.style.transform = "none";
            };
        }
    }, [isRotating]);



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

        // getPowerUps();

        socket.on("users", (users) => {
            users.forEach((user) => {
                user.isCurrentUser = user.userID === socket.id;
            });
            setTeams(users);
        });

        socket.on("receive power-up", ({ powerUp, from }) => {
            executePowerUp(powerUp);
            alert(`You were attacked with ${powerUp} by ${from}!`);
        });


        return () => {
            socket.off("users");
            socket.off("receive power-up");
        };
    }, []);

    // return (
    //     <>
    //         <div id="overlay" ref={overlayRef}></div>
    //         {username === "Anonymous user" ? (
    //             <div id="username-input">
    //                 <input type="text" value={inputValue} onChange={handleUsernameChange} />
    //                 <button onClick={handleUsernameSubmit}>Next</button>
    //             </div>
    //         ) : (
    //             <div id="power-page">
    //                 <div id="powerup-container">
    //                     {powers.map((power) => (
    //                         <button key={power.id} onClick={handleClickPower} value={power.effect}>
    //                             {power.name}
    //                         </button>
    //                     ))}
    //                 </div>

    //                 {clicked && (
    //                     <div id="teams-container">
    //                         <ul id="teams-list">
    //                             {teams
    //                                 .filter((team) => !team.isCurrentUser)
    //                                 .map((team) => (
    //                                     <li key={team.userID}>
    //                                         <button onClick={() => handleTeamClick(team)}>{team.username}</button>
    //                                     </li>
    //                                 ))}
    //                         </ul>
    //                         <button onClick={handleApply}>Apply</button>
    //                         <button onClick={handleClose}>Close</button>
    //                     </div>
    //                 )}

    //                 {popup && <div className="popup">
    //                     <div ref={popupRef} className="popup-box">
    //                         Hello
    //                         <button onClick={(e) => handlePopupClose(e)}>&times;</button>
    //                     </div>
    //                 </div>}
    //             </div>
    //         )}
    //     </>
    // );
    return {
        powers,
        teams,
        clicked,
        username,
        inputValue,
        clickedPower,
        clickedTeam,
        popup,
        popupCount,
        handleClickPower,
        handleUsernameChange,
        handleUsernameSubmit,
        handleClose,
        handleTeamClick,
        handlePopupClose,
        executePowerUp,
        handleApply,
        popupRef,
        overlayRef
    };
}

export default PowerUpContainer;
