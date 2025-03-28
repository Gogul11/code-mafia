import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import "dotenv/config";
import router from "./src/routes/routes.js";
import problem from "./src/routes/problems.route.js";

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
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

    socket.on("power-up attack", ({ powerUp, targetUserID, from }) => {
        console.log(`Power-up "${powerUp}" sent from ${from} to ${targetUserID}`);

        if (users.has(targetUserID)) {
            io.to(targetUserID).emit("receive power-up", { powerUp, from });
        }
    });
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("<h1>Code Mafia API ENDPOINT</h1>");
});
app.use("/api", router);
app.use("/problem", problem);

server.listen(PORT, () => {
    console.log(`The server is listening on port: ${PORT}`);
});
