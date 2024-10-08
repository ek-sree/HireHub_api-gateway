import { Request, Response } from "express";
import jobpostRabbitMqClient from './rabbitMQ/client';

export const jobpostController = {

    addJob: async (req: Request, res: Response) => {        
        try {
            const operation = 'add-new-job';
            console.log("req data from frontend", req.body);
            
            const { position, place, jobType, employmentType, experience, skills, recruiterId, companyName } = req.body;

            if (!position || !place || !jobType.length || !employmentType.length || !skills.length || !recruiterId || !companyName || !experience) {
                return res.status(400).json({ error: "Please fill in all fields" });
            }
            const jobData = {
                position,
                place,
                jobType,
                employmentType,
                experience,
                skills,
                recruiterId,
                companyName
            }; 
            const response = await jobpostRabbitMqClient.produce({ jobData }, operation);
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
            res.status(200).json(response);
        } catch (error) {
            console.error("Error in getting all jobs data", error)
            res.status(500).json({error: "error occured fetching all jobs"});
        }
    },

    getAllJobs: async (req: Request, res: Response) => {
        try {
            const employmentType = req.query.employment as string[] | undefined;
            const jobType = req.query.job as string[] | undefined;
            const searchPlace = req.query.search as string | undefined;    
            const operation = 'get-all-jobs';
            const response = await jobpostRabbitMqClient.produce({ employmentType, jobType, searchPlace }, operation);
            res.status(200).json(response);
        } catch (error) {
            console.error("Error in getting all jobs data", error)
            res.status(500).json({ error: "error occured fetching all jobs" });
        }
    },    

    editJob: async(req: Request, res: Response) => {        
        try {
            const { position, place, jobType, employmentType,experience, skills } = req.body;
            const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : '';
            if(!position || !place || !jobType || !employmentType || !skills || !jobId || !experience){
                return res.status(400).json({ error: "Please fill in all fields" });
            }
            const jobData ={
                position,
                place,
                jobId,
                jobType,
                employmentType,
                experience,
                skills
            }
            const operation = 'edit-job';
            const response = await jobpostRabbitMqClient.produce({jobData}, operation);
            return res.status(200).json(response);
        } catch (error) {
            console.error("Error editing jobs data", error)
            res.status(500).json({error: "error occured fetching all jobs"});
        }
    },

    applyJob: async(req: Request, res: Response)=>{
        try {
            const jobId = req.query.jobId;            
            const { userId,name,email,phone,resumes } = req.body;
            if(!userId || !jobId || !name || !email || !phone || !resumes){
                return res.status(400).json({ error: "Please fill in all fields" });
            }
            
            const operation = 'apply-job';
            const response = await jobpostRabbitMqClient.produce({userId,jobId,name,email,phone,resumes},operation);
            return res.json(response);
        } catch (error) {
            console.error("Error applying job", error)
            res.status(500).json({error: "error occured applying job"});
        }
    },

    viewApplication: async(req: Request, res: Response)=>{
        try {
            const jobId = req.query.jobId;
            const page = req.query.page;
            const limit = req.query.limit;            
            if(!jobId){
                return res.status(400).json({ error: "jobid is missing" });
            }
            const operation = 'view-application';
            const response = await jobpostRabbitMqClient.produce({jobId,page, limit},operation)
            return res.json(response);
        } catch (error) {
            console.error("Error fetching job application", error)
            res.status(500).json({error: "error occured fetching job application"});
        }
    },

    viewAwaitApplication: async(req:Request, res:Response)=>{
        try {
            const jobId = req.query.jobId;
            const page = req.query.page;
            const limit = req.query.limit;
            if(!jobId){
                return res.status(400).json({ error: "jobid is missing" });
            }
            const operation = 'view-awaited-application';
            const response = await jobpostRabbitMqClient.produce({jobId, page, limit}, operation);
            return res.json(response);
        } catch (error) {
            console.error("Error fetching awated job application", error)
            res.status(500).json({error: "error occured fetching awated job application"});
        }
    },

    awaitApplication: async(req:Request, res:Response)=>{
        try {
            const {jobId, applicationId} = req.query;
            if(!jobId || !applicationId){
                return res.status(400).json({error:"Job id or application id missing"})
            }
            const operation = 'await-application';
            const response = await jobpostRabbitMqClient.produce({jobId, applicationId}, operation);
            return res.json(response);
        } catch (error) {
            console.error("Error awaiting application", error)
            res.status(500).json({error: "error occured awaiting application"});
        }
    },

    acceptApplication: async(req: Request, res: Response)=>{
        try {
            const {jobId, applicationId} = req.query;
            if(!jobId || !applicationId){
                return res.status(400).json({error:"Job id or application id missing"})
            }
            const operation = 'accept-application'
            const response = await jobpostRabbitMqClient.produce({jobId,applicationId},operation);
            return res.json(response);
        } catch (error) {
            console.error("Error accepting application", error)
            res.status(500).json({error: "error occured accepting application"});
        }
    },

    rejectApplication: async(req: Request, res: Response)=>{
        try {
            const {jobId, applicationId} = req.query;
            if(!jobId || !applicationId){
                return res.status(400).json({error:"Job id or application id missing"})
            }
            const operation = 'reject-application';
            const response = await jobpostRabbitMqClient.produce({jobId,applicationId},operation)
            return res.json(response);
        } catch (error) {
            console.error("Error rejecting application", error)
            res.status(500).json({error: "error occured rejecting application"});
        }
    },

    selectedCandidtes: async(req:Request, res:Response)=>{
        try {
            const {recruiterId} = req.query;
            
            if(!recruiterId){
                return res.status(400).json({error:"reruiterId is missing"})
            }
            const operation = 'all-cadidates'
            const response = await jobpostRabbitMqClient.produce({recruiterId},operation)
            return res.json(response);
        } catch (error) {
            console.error("Error showing selected application", error)
            res.status(500).json({error: "error occured fetching selected application"});
        }
    },

    shortListedApplication: async(req: Request, res:Response)=>{
        try {            
            const jobId = req.query.jobId;
            if(!jobId){
                return res.status(400).json({error:"jobId is missing"})
            }
            const operation = 'shortlist-application';
            const response = await jobpostRabbitMqClient.produce({jobId},operation);
            return res.json(response);
        } catch (error) {
            console.error("Error fetching job selected application", error)
            res.status(500).json({error: "error occured job selected application"});
        }
    },

    softDeleteJob: async(req: Request, res: Response)=>{
        try {
            const jobId = req.params.id;
            if(!jobId){
                return res.status(400).json({error:"Job id is not reached"})
            }
            const operation = 'update-job-status'
            const response = await jobpostRabbitMqClient.produce({jobId}, operation);
            return res.json(response);
        } catch (error) {
            console.error("Error deleting job", error)
            res.status(500).json({error: "error occured deleting job"});
        }
    }
}
