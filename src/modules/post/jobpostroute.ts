import express from 'express';
import authencticateToken from '../../middleware/authMiddleware';
import { jobpostController } from './jobpostController';


const jobpostRoutet = express.Router();

jobpostRoutet.post('/addjob',authencticateToken, jobpostController.addJob);
jobpostRoutet.get('/getjob', authencticateToken, jobpostController.getRecruiterJobs);
jobpostRoutet.get('/getalljobs', authencticateToken, jobpostController.getAllJobs);
jobpostRoutet.post('/editjobs', authencticateToken, jobpostController.editJob);
jobpostRoutet.post('/applyjob', authencticateToken, jobpostController.applyJob);
jobpostRoutet.get('/viewApplications', authencticateToken, jobpostController.viewApplication);
jobpostRoutet.post('/awaitApplication', authencticateToken, jobpostController.awaitApplication);
jobpostRoutet.post('/acceptApplication', authencticateToken, jobpostController.acceptApplication);
jobpostRoutet.post('/rejectApplication', authencticateToken, jobpostController.rejectApplication);
jobpostRoutet.get('/acceptedApplications', authencticateToken, jobpostController.selectedCandidtes);
jobpostRoutet.get('/shortlistedApplication', authencticateToken, jobpostController.shortListedApplication);
jobpostRoutet.put('/softdeleteJob/:id', authencticateToken, jobpostController.softDeleteJob);
jobpostRoutet.get('/viewAwaitApplication', authencticateToken, jobpostController.viewAwaitApplication);


export { jobpostRoutet }