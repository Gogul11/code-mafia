// Imports
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import router from './src/routes/routes.js';
import problem from './src/routes/problems.route.js';

// Constants
const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
    res.send("<h1>Code Mafia API ENDPOINT</h1>");
});
app.use("/api", router);
app.use("/problem", problem);

app.listen(PORT, () => {
    console.log(`The server is listening on port: ${PORT}`);
});