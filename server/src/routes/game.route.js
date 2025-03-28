import express from 'express';
import { getPowers } from '../controllers/game.controller.js';

const gameRouter = express.Router();

gameRouter.get("/getpowers", getPowers);

export default gameRouter;