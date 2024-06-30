import express from 'express';
import authencticateToken from '../../middleware/authMiddleware';
import { jobpostController } from './jobpostController';


const jobpostRoutet = express.Router();

jobpostRoutet.post('/addjob',authencticateToken, jobpostController.addJob);

export { jobpostRoutet }