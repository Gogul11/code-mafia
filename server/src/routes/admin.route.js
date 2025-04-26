import express from 'express';
import getAndCacheChallenge from '../utils/challenges-cache.js';
import { signup } from '../controllers/auth.controller.js';
import adminVerify from '../middleware/adminVerify.js'

const admin = express.Router()

admin.post('/problems/refresh-cache', async (req, res) => {
    try {
        await getAndCacheChallenge();
        res.status(200).json({ message: 'Challenge cache refreshed successfully' });
    } catch (err) {
        console.error('Error refreshing challenge cache:', err);
        res.status(500).json({ error: 'Failed to refresh challenge cache' });
    }
});

admin.post('/signup', adminVerify, signup);

export default admin;