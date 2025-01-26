import express from 'express';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("<h1>Code Mafia API ENDPOINT</h1>");
});

app.listen(PORT, () => {
    console.log(`The server is listening on port: ${PORT}`);
});