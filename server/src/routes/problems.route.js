import express from 'express';
import { getProblem, getChallengesSolvedStatus } from '../controllers/problems.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const problem = express.Router();

problem.get('/', getProblem);
problem.get('/status', verifyToken, getChallengesSolvedStatus);

export default problem;