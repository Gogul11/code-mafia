import { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../../socket.js";
import { setTeams } from "../Store/store.js";

function PowerUpController() {
    const [powers, setPowers] = useState([
        { id: 1, name: "Situs Inversus", description: "", effect: "flip", icon: "/assets/swap.svg", cost: 5 },
        { id: 2, name: "Smoke Screen", description: "", effect: "blind", icon: "/assets/smokescreen.png", cost: 5 },
        { id: 3, name: "The Wall Breaker", description: "", effect: "wall-breaker", icon: "/assets/wallbreaker.png", cost: 10 },
        { id: 4, name: "Zip Bomb", description: "", effect: "zip-bomb", icon: "/assets/zipbomb.png", cost: 5 },
        { id: 5, name: "The Suicide Bomber", description: "", effect: "suicide-bomber", icon: "/assets/suicidebomber.png", cost: 5 },
        { id: 6, name: "WindMill", description: "", effect: "windmill", icon: "/assets/windmill.png", cost: 5 },
        { id: 7, name: "System Overload", description: "", effect: "glitch", icon: "/assets/systemoverload.png", cost: 5 },
        { id: 8, name: "Innocency", description: "", effect: "innocency", icon: "/assets/innocency.png", cost: 5 },
        { id: 9, name: "Zero Kelvin", description: "", effect: "freeze", icon: "/assets/snowflake.svg", cost: 5 },
        { id: 10, name: "Shield", description: "", effect: "shield", icon: "/assets/shield.svg", cost: 5 },
    ]);
    const [username, setUsername] = useState("");
    const [socketUser, setSocketUser] = useState("");
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

    const [powerupsDialogOpen, setPowerupsDialogOpen] = useState(false);
    const [powerupPopupOpen, setPowerupPopupOpen] = useState(false);
    const [message, setMessage] = useState("");

    // For powerups timers
    const [activePowerUps, setActivePowerUps] = useState([]);
    const powerUpTimers = {};

    async function initSocketConnection() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_BASEAPI}/auth/verify`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.valid && response.data.team_name) {
                    setUsername(response.data.team_name);
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

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function getCoins() {
        sleep(2000); // wait 2 secs for coins to be updated on DB
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

    function executePowerUp(effect, remainingTime = 180) {

        const duration = remainingTime * 1000;

        if (effect === "windmill") {
            setIsRotating(true);
            setTimeout(() => {
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
            const elements = document.querySelectorAll("p, h1, h2, h3, li, button");
            const originalTexts = new Map();

            elements.forEach((element) => {
                const original = element.textContent;
                if (!original || original.length < 4) return;

                originalTexts.set(element, original);

                const glitched = original.split('').map(char =>
                    Math.random() > 0.7 ? String.fromCharCode(33 + Math.floor(Math.random() * 94)) : char
                ).join('');

                element.textContent = glitched;
            });

            setTimeout(() => {
                originalTexts.forEach((original, element) => {
                    element.textContent = original;
                });
            }, duration);
        }

        else if (effect === "blind") {
            document.body.classList.add("foggy");
            setTimeout(() => { document.body.classList.remove("foggy") }, duration);
        }

        else if (effect === "zip-bomb") {
            const bombEnd = Date.now() + duration;

            let zipInterval = setInterval(() => {
                if (Date.now() > bombEnd) {
                    clearInterval(zipInterval);
                    return;
                }

                createZipPopup();
            }, 900);

            setTimeout(() => {
                clearInterval(zipInterval);
                document.querySelectorAll(".zip-popup").forEach(el => el.remove());
            }, duration);
        }

    }

    function createZipPopup() {
        const popup = document.createElement("div");
        popup.className = "zip-popup";
        popup.style.top = `${Math.random() * (window.innerHeight - 150)}px`;
        popup.style.left = `${Math.random() * (window.innerWidth - 200)}px`;

        // Close button
        const close = document.createElement("span");
        close.textContent = "×";
        close.className = "zip-popup-close";
        close.onclick = () => popup.remove();

        const header = document.createElement("div");
        header.className = "zip-popup-header";
        header.textContent = "Extracting...";

        const message = document.createElement("div");
        message.textContent = "Unzipping layer.zip. Please wait...";

        popup.appendChild(close);
        popup.appendChild(header);
        popup.appendChild(message);
        document.body.appendChild(popup);
    }

    function handleApply() {
        if (clickedPower !== "shield" && clickedPower !== "innocency" && (!clickedPower || !clickedTeam)) {
            alert("Please select a power and team.");
            return;
        }

        if (clickedPower === "suicide-bomber") {
            socket.emit("suicide-attack", {
                targetUserID: clickedTeam.userID,
                currentUserID: socketUser.userID,
                from: username,
                token: localStorage.getItem("token")
            })
            setPowerupsDialogOpen(false);
            setMessage(
                <>
                    You used ${clickedPower} on ${clickedTeam.username}
                    <br />
                    -5
                    <img src="/assets/currency.svg" />
                </>
            );
            setPowerupPopupOpen(true);
        } else if (clickedPower !== "shield" && clickedPower !== "innocency" && clickedPower !== "wall-breaker") {
            socket.emit("power-up attack", {
                powerUp: clickedPower,
                targetUserID: clickedTeam.userID,
                from: username,
                token: localStorage.getItem("token")
            });
            setPowerupsDialogOpen(false);
            setMessage(
                <>
                    You used {clickedPower} on {clickedTeam.username}
                    <br />
                    -5
                    <img src="/assets/currency.svg" />
                </>
            );
            setPowerupPopupOpen(true);
        } else if (clickedPower === "wall-breaker") {
            socket.emit("power-up attack", {
                powerUp: clickedPower,
                targetUserID: clickedTeam.userID,
                from: username,
                token: localStorage.getItem("token")
            });
            setPowerupsDialogOpen(false);
            setMessage(
                <>
                    You used {clickedPower} on {clickedTeam.username}
                    <br />
                    -10
                    <img src="/assets/currency.svg" />
                </>
            );
            setPowerupPopupOpen(true);
        } else {
            socket.emit("power-up attack", {
                powerUp: clickedPower,
                from: username,
                targetUserID: socketUser.userID,
                token: localStorage.getItem("token")
            });
            setPowerupsDialogOpen(false);
            setMessage(
                <>
                    You used {clickedPower}
                    <br />
                    -5 <img src="/assets/currency.svg" alt="currency" />
                    {clickedPower === "innocency" && (
                        <>
                            <br />
                            +8 <img src="/assets/currency.svg" alt="currency" />
                        </>
                    )}
                </>
            );

            setPowerupPopupOpen(true);
        }


        setClickedPower("");
        setClickedTeam(null);
        getCoins();
    }

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
        initSocketConnection();

        socket.on("users", (users) => {
            users.forEach((user) => {
                user.isCurrentUser = user.userID === socket.id;
                if (user.isCurrentUser) {
                    setSocketUser(user);
                }
            });
            setTeams(users);
        });

        socket.on("receive power-up", ({ powerUp, from }) => {
            executePowerUp(powerUp);
            const remainingTime = powerUp === "shield" ? 300 : 180;

            if (powerUp !== "innocency" && powerUp !== "wall-breaker" && powerUp !== "suicide-bomber") {
                setActivePowerUps((prev) => [
                    ...prev,
                    { powerUp, remainingTime },
                ]);

                if (powerUp === "shield") {
                    if (!powerUpTimers["shield"]) {
                        powerUpTimers["shield"] = setInterval(() => {
                            setActivePowerUps((prev) => {
                                const updated = prev.map((p) =>
                                    p.powerUp === "shield"
                                        ? { ...p, remainingTime: p.remainingTime - 1 }
                                        : p
                                );

                                if (updated.some((p) => p.powerUp === "shield" && p.remainingTime <= 0)) {
                                    clearInterval(powerUpTimers["shield"]);
                                    delete powerUpTimers["shield"];
                                    return updated.filter((p) => p.powerUp !== "shield");
                                }
                                return updated;
                            });
                        }, 1000);
                    }
                } else {
                    // Other powers always create their own independent timer
                    const timer = setInterval(() => {
                        setActivePowerUps((prev) => {
                            const updated = prev.map((p) =>
                                p.powerUp === powerUp
                                    ? { ...p, remainingTime: p.remainingTime - 1 }
                                    : p
                            );

                            if (updated.some((p) => p.powerUp === powerUp && p.remainingTime <= 0)) {
                                clearInterval(timer);
                                return updated.filter((p) => p.powerUp !== powerUp);
                            }
                            return updated;
                        });
                    }, 1000);
                }
            }

            if (powerUp !== "shield" && powerUp !== "innocency") {
                setMessage(
                    <>
                        You were attacked with {powerUp} by {from}!
                    </>
                );
                setPowerupPopupOpen(true);
            }
        });

        socket.on("apply-active-powerups", (activePowerups) => {
            activePowerups.forEach(({ powerUp, remainingTime }) => {
                executePowerUp(powerUp, remainingTime);

                if (powerUp !== "innocency" && powerUp !== "wall-breaker" && powerUp !== "suicide-bomber") {
                    setActivePowerUps((prev) => [
                        ...prev,
                        { powerUp, remainingTime },
                    ]);

                    if (powerUp === "shield") {
                        if (!powerUpTimers["shield"]) {
                            powerUpTimers["shield"] = setInterval(() => {
                                setActivePowerUps((prev) => {
                                    const updated = prev.map((p) =>
                                        p.powerUp === "shield"
                                            ? { ...p, remainingTime: p.remainingTime - 1 }
                                            : p
                                    );

                                    if (updated.some((p) => p.powerUp === "shield" && p.remainingTime <= 0)) {
                                        clearInterval(powerUpTimers["shield"]);
                                        delete powerUpTimers["shield"];
                                        return updated.filter((p) => p.powerUp !== "shield");
                                    }
                                    return updated;
                                });
                            }, 1000);
                        }
                    } else {
                        const timer = setInterval(() => {
                            setActivePowerUps((prev) => {
                                const updated = prev.map((p) =>
                                    p.powerUp === powerUp
                                        ? { ...p, remainingTime: p.remainingTime - 1 }
                                        : p
                                );

                                if (updated.some((p) => p.powerUp === powerUp && p.remainingTime <= 0)) {
                                    clearInterval(timer);
                                    return updated.filter((p) => p.powerUp !== powerUp);
                                }
                                return updated;
                            });
                        }, 1000);
                    }
                }
            });
        });

        socket.on("shield-down", ({ message }) => {
            setMessage(
                <>
                    {message}
                </>
            );
            setPowerupPopupOpen(true);

            setActivePowerUps((prev) => prev.filter((p) => p.powerUp !== "shield"));

            if (powerUpTimers["shield"]) {
                clearInterval(powerUpTimers["shield"]);
                delete powerUpTimers["shield"];
            }
        });


        socket.on("coins-error", ({ message }) => {
            setMessage(
                <>
                    {message}
                </>
            );
            setPowerupPopupOpen(true);
        });

        socket.on("blocked-by-shield", ({ message }) => {
            setMessage(
                <>
                    {message}
                </>
            );
            setPowerupPopupOpen(true);
        });

        console.log("active power request")
        socket.emit("get-active-powerups");

        return () => {
            socket.off("users");
            socket.off("receive power-up");
            socket.off("apply-active-powerups");
            socket.off("coins-error");
            socket.off("blocked-by-shield");
        };
    }, []);

    return {
        powers,
        username,
        clickedPower,
        clickedTeam,
        popup,
        popupCount,
        coins,
        powerupPopupOpen,
        powerupsDialogOpen,
        message,
        activePowerUps,
        getCoins,
        setClickedPower,
        setClickedTeam,
        handlePopupClose,
        executePowerUp,
        handleApply,
        setPowerupPopupOpen,
        setPowerupsDialogOpen,
        setMessage,
        popupRef,
        overlayRef
    };
}

export default PowerUpController;
