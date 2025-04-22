import express from 'express';
import { getPowers, getCoins } from '../controllers/game.controller.js';

const gameRouter = express.Router();

gameRouter.get("/getpowers", getPowers);
gameRouter.get("/getcoins", getCoins);

export default gameRouter;