import express from 'express';
import { login, verify, signup } from '../controllers/auth.controller.js';

const auth = express.Router();

auth.post('/login', login);
auth.get('/verify', verify);
auth.post('/signup', signup)

export default auth;
