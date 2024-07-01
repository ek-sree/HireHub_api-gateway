import { Request, Response } from "express";
import jobpostRabbitMqClient from './rabbitMQ/client';

export const jobpostController = {

    addJob: async (req: Request, res: Response) => {
        console.log("Req reached jobpost controller");
        
        try {
            const operation = 'add-new-job';
            console.log("req data from frontend", req.body);
            
            const { position, place, jobType, employmentType, skills, recruiterId, companyName } = req.body;

            if (!position || !place || !jobType.length || !employmentType.length || !skills.length || !recruiterId || !companyName) {
                return res.status(400).json({ error: "Please fill in all fields" });
            }
console.log("................");

            const jobData = {
                position,
                place,
                jobType,
                employmentType,
                skills,
                recruiterId,
                companyName
            }; 
            console.log("Sending data to RabbitMQ:", { jobData });
            const response = await jobpostRabbitMqClient.produce({ jobData }, operation);
            console.log("Response from add new job post", response);
            res.status(200).json(response);
        } catch (error) {
            console.error("Error in addJob controller:", error);
            res.status(500).json({ error: "cerror occure creating new job" });
        }
    },

    getRecruiterJobs: async (req: Request, res: Response) => {
        try {
            const recruiterId = req.query.recruiterId;
            if(!recruiterId){
                return res.status(400).json({ error: "Recruiter ID is required" });
            }
            const operation = 'get-recruiter-jobs';
            const response = await jobpostRabbitMqClient.produce({recruiterId}, operation);
            console.log("response from get all jobs", response);
            res.status(200).json(response);
        } catch (error) {
            console.error("Error in getting all jobs data", error)
            res.status(500).json({error: "error occured fetching all jobs"});
        }
    },

    getAllJobs: async(req: Request, res: Response) => {
        try {
            const operation = 'get-all-jobs';
            const response = await jobpostRabbitMqClient.produce({},operation);
            console.log("got response",response);
            res.status(200).json(response);
        } catch (error) {
            console.error("Error in getting all jobs data", error)
            res.status(500).json({error: "error occured fetching all jobs"});
        }
    },

    editJob: async(req: Request, res: Response) => {
        console.log("reached here fpr edit????",req.body);
        
        try {
            const { position, place, jobType, employmentType, skills } = req.body;
            const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : '';
            console.log("jobId", jobId);
            if(!position || !place || !jobType || !employmentType || !skills || !jobId){
                return res.status(400).json({ error: "Please fill in all fields" });
            }
            const jobData ={
                position,
                place,
                jobId,
                jobType,
                employmentType,
                skills
            }
            const operation = 'edit-job';
            const response = await jobpostRabbitMqClient.produce({jobData}, operation);
            console.log("response edited data", response);
            return res.status(200).json(response);
        } catch (error) {
            console.error("Error editing jobs data", error)
            res.status(500).json({error: "error occured fetching all jobs"});
        }
    }
}
