import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import client from './src/config/redisdb.js';

import router from "./src/routes/routes.js";
import { getLeader } from "./src/controllers/leader.controller.js";
import auth from "./src/routes/auth.route.js";
import jwt from "jsonwebtoken";
import { getCoinsByTeamId, updateCoins } from './src/utils/coin.js';

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // allowing all origin as some antivirus interver dynuddns.net. Change it if a domain is bought
        methods: ["GET", "POST"],
        credentials: false
    }
});


const users = new Map();

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("Invalid username"));
    }
    socket.username = username;
    next();
});


io.on("connection", (socket) => {
    console.log(`User connected: ${socket.username} - ${socket.id}`);

    users.set(socket.id, { userID: socket.id, username: socket.username });

    io.emit("users", Array.from(users.values()));

    socket.on("disconnect", () => {
        users.delete(socket.id);
        io.emit("users", Array.from(users.values()));
        console.log(`User disconnected: ${socket.username} - ${socket.id}`);
    });


    socket.on("power-up attack", async ({ powerUp, targetUserID, from, token }) => {
        let deductCoins = powerUp === "wall-breaker" || powerUp === "freeze" ? (powerUp === "wall-breaker" ? 10 : 15) : 5;
        console.log(`Power-up "${powerUp}" sent from ${from} to ${targetUserID}`);

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const team_id = decoded.team_id;

        const avlblCoins = await getCoinsByTeamId(team_id);
        if (avlblCoins === null) {
            console.error("Error fetching coins for team:", team_id);
            return;
        }
        if (avlblCoins < 5) {
            socket.emit("coins-error", { message: "Not enough coins" });
            return;
        }

        if (users.has(targetUserID)) {
            const targetUser = users.get(targetUserID);
            const targetUsername = targetUser.username;

            const shieldKey = `powerup:${targetUsername}:shield`;

            // Check if shield is active
            const hasShield = await client.exists(shieldKey);
            if (hasShield && powerUp === "wall-breaker") {
                if (avlblCoins < 10) {
                    socket.emit("coins-error", { message: "Not enough coins" });
                    return;
                }
                client.del(shieldKey);
                io.to(targetUserID).emit("shield-down", { message: `${from} took down your shield` });
            }
            else if (powerUp === "innocency") {
                if (hasShield) {
                    client.del(shieldKey);
                    socket.emit("shield-down", { message: `You dropped your shield` });
                    await updateCoins(team_id, avlblCoins + 8);
                }
                else {
                    socket.emit("blocked-by-shield", { message: `You have no active shield!` });
                }
                return;
            }
            else if (hasShield && powerUp !== "shield") {
                socket.emit("blocked-by-shield", { message: `${targetUsername} has an active shield!` });
                return;
            } else if (hasShield && powerUp === "shield") {
                socket.emit("blocked-by-shield", { message: `Shield already active   ` });
                return;
            }

            const key = `powerup:${targetUsername}:${powerUp}`;
            const expiryTime = powerUp === "shield" ? 300 : 180;

            await client.set(key, JSON.stringify({ from, powerUp }), {
                EX: expiryTime
            });

            io.to(targetUserID).emit("receive power-up", { powerUp, from });
            await updateCoins(team_id, avlblCoins - deductCoins);
        }
    });

    socket.on("suicide-attack", async ({ targetUserID, currentUserID, from, token }) => {
        const powerUp = "suicide-bomber"
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const team_id = decoded.team_id;

            const avlblCoins = await getCoinsByTeamId(team_id);
            if (avlblCoins === null) {
                console.error("Error fetching coins for team:", team_id);
                return;
            }
            if (avlblCoins < 5) {
                socket.emit("coins-error", { message: "Not enough coins" });
                return;
            }

            if (users.has(targetUserID) && users.has(currentUserID)) {
                const targetUser = users.get(targetUserID);
                const currentUser = users.get(currentUserID)

                const targetUsername = targetUser.username;
                const currentUsername = currentUser.username

                const targetShieldKey = `powerup:${targetUsername}:shield`;
                const currentShieldKey = `powerup:${currentUsername}:shield`;

                // Check if shield is active
                const targetHasShield = await client.exists(targetShieldKey);
                const currentHasShield = await client.exists(currentShieldKey);
                if (targetHasShield && currentHasShield) {
                    client.del(targetShieldKey);
                    client.del(currentShieldKey);
                    io.to(targetUserID).emit("shield-down", { message: `${targetUsername} has an active shield!` });
                    socket.emit("shield-down", { message: `You dropped your shield` });

                    io.to(targetUserID).emit("receive power-up", { powerUp, from });
                    await updateCoins(team_id, avlblCoins - 10);
                    return;
                }
                else if (targetHasShield && !currentHasShield) {
                    socket.emit("blocked-by-shield", { message: `You don't have active shield!` });
                    return;
                }
                else if (!targetHasShield && currentHasShield) {
                    socket.emit("blocked-by-shield", { message: `${targetUsername} has no active shield!` });
                    io.to(targetUserID).emit("blocked-by-shield", { message: `${targetUsername}'s suicide bomber attack failed—no shield, no damage` });
                    return;
                }
                else if (!targetHasShield && !currentHasShield) {
                    socket.emit("blocked-by-shield", { message: `You both have no active shield!` });
                    io.to(targetUserID).emit("blocked-by-shield", { message: `${targetUsername}'s suicide bomber attack failed—no shield, no damage` });
                    return;
                }
            }
        }
        catch (err) {
            console.error("Error in suicide-attack:", err.message);
        }
    })

    socket.on("get-active-powerups", async () => {
        const username = socket.username;

        try {

            const keys = await client.keys(`powerup:${username}:*`);

            const activePowerups = [];
            for (const key of keys) {
                const data = await client.get(key);
                if (data) {

                    const ttl = await client.ttl(key);
                    const powerupData = JSON.parse(data);


                    powerupData.remainingTime = ttl > 0 ? ttl : 180;

                    activePowerups.push(powerupData);
                }
            }

            console.log(`Found ${activePowerups.length} active powerups for user ${username}`);
            socket.emit("apply-active-powerups", activePowerups);
        } catch (err) {
            console.error("Error fetching active powerups:", err);
        }
    });
});


app.use(cors({
    origin: "*", // allowing all origin as some antivirus interver dynuddns.net. Change it if a domain is bought
    credentials: false
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("<h1>Code Mafia API ENDPOINT</h1>");
});
app.use("/api", router);
app.use("/auth", auth);

setInterval(getLeader, 60000);


server.listen(PORT, () => {
    console.log(`The server is listening on port: ${PORT}`);
});
