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

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "https://code-mafia.vercel.app" // deployed frontend url
        ],
        methods: ["GET", "POST"],
        credentials: true
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
    console.log(`User connected: ${socket.id}`);

    users.set(socket.id, { userID: socket.id, username: socket.username });

    io.emit("users", Array.from(users.values()));

    socket.on("disconnect", () => {
        users.delete(socket.id);
        io.emit("users", Array.from(users.values()));
        console.log(`User disconnected: ${socket.id}`);
    });

    
    socket.on("power-up attack", async ({ powerUp, targetUserID, from }) => {
        console.log(`Power-up "${powerUp}" sent from ${from} to ${targetUserID}`);

        if (users.has(targetUserID)) {
            const targetUser = users.get(targetUserID);
            const targetUsername = targetUser.username;
            
      
            const key = `powerup:${targetUsername}:${powerUp}`;
            const expiryTime = 300;

            await client.set(key, JSON.stringify({ from, powerUp }), {
                EX: expiryTime
            });

            io.to(targetUserID).emit("receive power-up", { powerUp, from });
        }
    });
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
                    
                 
                    powerupData.remainingTime = ttl > 0 ? ttl : 60; 
                    
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
    origin: [
        "http://localhost:3000",
        "https://code-mafia.vercel.app"
    ],
    credentials: true
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
