import express from 'express';
import authencticateToken from '../../middleware/authMiddleware';
import { jobpostController } from './jobpostController';


const jobpostRoutet = express.Router();

jobpostRoutet.post('/addjob',authencticateToken, jobpostController.addJob);
jobpostRoutet.get('/getjob', authencticateToken, jobpostController.getRecruiterJobs);
jobpostRoutet.get('/getalljobs', authencticateToken, jobpostController.getAllJobs);
jobpostRoutet.post('/editjobs', authencticateToken, jobpostController.editJob);

export { jobpostRoutet }