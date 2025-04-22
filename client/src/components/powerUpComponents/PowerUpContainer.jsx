import { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../../socket.js";

function PowerUpContainer() {
    const [powers, setPowers] = useState([
        { id: 1, name: "Situs Inversus", description: "", effect: "flip", icon: "/assets/swap.svg" },
        { id: 2, name: "Smoke Screen", description: "", effect: "blind", icon: "/assets/smokescreen.png" },
        { id: 3, name: "The Wall Breaker", description: "", effect: "wall-breaker", icon: "/assets/wallbreaker.png" },
        { id: 4, name: "Zip Bomb", description: "", effect: "zip-bomb", icon: "/assets/zipbomb.png" },
        { id: 5, name: "The Suicide Bomber", description: "", effect: "suicide-bomber", icon: "/assets/suicidebomber.png" },
        { id: 6, name: "WindMill", description: "", effect: "windmill", icon: "/assets/windmill.png" },
        { id: 7, name: "System Overload", description: "", effect: "glitch", icon: "/assets/systemoverload.png" },
        { id: 8, name: "Innocency", description: "", effect: "innocency", icon: "/assets/innocency.png" },
        { id: 9, name: "Zero Kelvin", description: "", effect: "freeze", icon: "/assets/snowflake.svg" },
        { id: 10, name: "Shield", description: "", effect: "shield", icon: "/assets/shield.svg" },
    ]);
    const [teams, setTeams] = useState([]);
    const [username, setUsername] = useState("");
    const [clickedPower, setClickedPower] = useState("");
    const [clickedTeam, setClickedTeam] = useState(null);

    const angleRef = useRef(0);
    const requestRef = useRef(null);
    const [isRotating, setIsRotating] = useState(false);
    const overlayRef = useRef(null);

    const [popup, setPopup] = useState(false);
    const [popupCount, setPopupCount] = useState(0)
    const popupRef = useRef(null);
    const [coins, setCoins] = useState(0);

    async function initSocketConnection() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_BASEAPI}/auth/verify`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.valid && response.data.team_name) {
                    setUsername(response.data.team_name);
                    console.log("Username from server:", response.data.team_name);
                    socket.auth = { username: response.data.team_name };
                    socket.connect();
                }
            } catch (error) {
                console.error('Token verification failed', error);
            }
        }
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

    async function getCoins(){
        axios.get(`${process.env.REACT_APP_SERVER_BASEAPI}/game/getcoins`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(response => {
            if (response.data && response.data.coins !== undefined) {
                setCoins(response.data.coins);
            }
        }).catch(err => {
            console.error("Failed to fetch coins:", err);
        });
    }

    function executePowerUp(effect, remainingTime = 60) {

        const duration = remainingTime * 1000;

        if (effect === "windmill") {
            setIsRotating(true);


            if (windmillTimerRef.current) {
                clearTimeout(windmillTimerRef.current);
            }

            windmillTimerRef.current = setTimeout(() => {
                setIsRotating(false);
            }, duration);
        }
        else if (effect === "flip") {
            document.body.classList.add("flip");
            setTimeout(() => { document.body.classList.remove("flip") }, duration);
        }
        else if (effect === "freeze") {
            if (overlayRef.current) {
                overlayRef.current.classList.add("overlay");
                setTimeout(() => {
                    if (overlayRef.current) {
                        overlayRef.current.classList.remove("overlay")
                    }
                }, duration);
            }
        }
        else if (effect === "glitch") {
            setPopup(true);

        }
        else if (effect === "blind") {
            document.body.classList.add("foggy");
            setTimeout(() => { document.body.classList.remove("foggy") }, duration);
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
        getCoins();
    }


    const windmillTimerRef = useRef(null);
    const effectTimersRef = useRef([]);

    useEffect(() => {
        if (isRotating) {
            const rotate = () => {
                angleRef.current += 1;
                document.body.style.transform = `rotate(${angleRef.current}deg)`;
                document.body.style.transformOrigin = "50% 50%";
                requestRef.current = requestAnimationFrame(rotate);
            };

            requestRef.current = requestAnimationFrame(rotate);

            return () => {
                cancelAnimationFrame(requestRef.current);
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

        initSocketConnection();

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

        socket.on("apply-active-powerups", (activePowerups) => {
            console.log("Active powerups:", activePowerups);
            activePowerups.forEach(powerup => {
                executePowerUp(powerup.powerUp, powerup.remainingTime);
            });
        });


        socket.emit("get-active-powerups");

        return () => {
            socket.off("users");
            socket.off("receive power-up");
            socket.off("apply-active-powerups");


            if (windmillTimerRef.current) {
                clearTimeout(windmillTimerRef.current);
            }
        };
    }, []);

    return {
        powers,
        teams,
        username,
        clickedPower,
        clickedTeam,
        popup,
        popupCount,
        coins,
        getCoins,
        setClickedPower,
        setClickedTeam,
        handlePopupClose,
        executePowerUp,
        handleApply,
        popupRef,
        overlayRef
    };
}

export default PowerUpContainer;
