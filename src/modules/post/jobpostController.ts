import { Request, Response } from "express";
import jobpostRabbitMqClient from './rabbitMQ/client';

export const jobpostController = {

    addJob: async(req: Request, res: Response) => {
        console.log("Req reached jobpost controller");
        
        try {
            const operation = 'add-new-job';
            console.log("req data from fontend", req.body);
            
            const { position, place, jobType, employmentType, skills } = req.body;

            if (!position || !place || !jobType.length || !employmentType.length || !skills.length) {
                return res.status(400).json({ error: "Please fill in all fields" });
            }

            const jobData = {
                position,
                place,
                jobType,
                employmentType,
                skills
            }; 
            const response = await jobpostRabbitMqClient.produce({jobData}, operation);
            console.log("response get from add new job post",response);
            
        } catch (error) {
            
        }
    }
}