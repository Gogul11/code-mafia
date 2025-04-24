import express from 'express';
import { getProblem } from '../controllers/problems.controller.js';

const problem = express.Router()

problem.get('/', getProblem)

export default problem;