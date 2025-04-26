import express from 'express';
import { login, verify, signup } from '../controllers/auth.controller.js';
import adminVerify from '../middleware/adminVerify.js';
import verifyToken from '../middleware/verifyToken.js';

const auth = express.Router();

auth.post('/login', login);
auth.get('/verify', verifyToken, verify);
auth.post('/signup', adminVerify, signup);

export default auth;
