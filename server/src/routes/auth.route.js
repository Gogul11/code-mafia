import express from 'express';
import { login, verify } from '../controllers/auth.controller.js';

const auth = express.Router();

auth.post('/login', login);
auth.get('/verify', verify);

export default auth;
