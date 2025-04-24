import express from 'express';
import { getProblem, getChallengesSolvedStatus } from '../controllers/problems.controller.js';

const problem = express.Router();

problem.get('/', getProblem);
problem.get('/status', getChallengesSolvedStatus);

export default problem;