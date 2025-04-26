import express from 'express';
import { getPowers, getCoins } from '../controllers/game.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const gameRouter = express.Router();

gameRouter.get("/getpowers", getPowers);
gameRouter.get("/getcoins", verifyToken, getCoins);

export default gameRouter;