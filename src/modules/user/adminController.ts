import { Request, Response } from "express";
import { Adminclient } from "./grpc/client/grpcClient";
import { genenrateToken } from "../../jwt/jwtCreate";
import userRabbitMqClient from './rabbitMQ/client';
import recruiterRabbitMqClient from '../recruiter/rabbitMQ/client';
import postRabbitMqClient from "../post/rabbitMQ/client";



export const adminController = {
    
    loging:(req: Request, res: Response) => {        
        try {
            Adminclient.Login(req.body, (err: Error | null, result: any) =>{
                if(err){
                    console.log("Error while logging in admin");
                    return res.status(500).json({error:"Internal server", err})
                }
                if(!result.success){
                    return res.json(result);
                }
                const token = genenrateToken({id: result.admin_data._id, email: result.admin_data.email});
                let role = 'admin';
                res.cookie('role',role, { maxAge:3600000 });
                res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
                result.isRecruiter = null;
                result.token = token;
                return res.json(result);
            })
        } catch (error) {
            console.log("Error loging in", error);
            return res.status(500).json({error: "Internal server error"});
        }
    },

getUser: async (req: Request, res: Response) => {
    try {        
        const { page = 1, limit = 2 } = req.query;
        const operation = 'get-all-users';
        const response = await userRabbitMqClient.produce({ page: Number(page), limit: Number(limit) }, operation);
        return res.json(response);
    } catch (error) {
        console.log("Error fetching users", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
,

    getVerifiedRecruiter: async(req: Request, res: Response) => {
        try {
            const operation = 'unVerify-recruiter';
            const response = await recruiterRabbitMqClient.produce({}, operation);
            return res.json(response);
        } catch (error) {
            console.log("Error fetching unVerified Recruiter", error);
            return res.status(500).json({ error: "Internal server error" });
        }  
    },

    verifyRecruiter: async(req:Request, res:Response) => {
        try {
            const {recruiterId} = req.params
            const operation = 'verify-recruiter';
            const response = await recruiterRabbitMqClient.produce({recruiterId}, operation);
            return res.json(response);
        } catch (error) {
            
        }
    },

    getRecruiter: async(req: Request, res: Response) => {
        try {
            const { page=1 , limit=2 } = req.query;
            const operation = 'get-all-recruiter';
            const response = await recruiterRabbitMqClient.produce({page: Number(page), limit: Number(limit)}, operation);
            return res.json(response);
        } catch (error) {
            
        }
    },

    blockUser: async(req: Request, res: Response) => {
        try {
            const operation = 'block-user'
            const { userId } = req.params;            
            const response = await userRabbitMqClient.produce({userId},operation);
            console.log("response for block user", response);
            
            return res.json(response)
        } catch (error) {
            console.error("Error blocking/unblocking user", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    blockRecruiter: async(req: Request, res: Response) => {
        try {
            const operation = 'block-recruiter'
            const { recruiterId } = req.params;
            const response = await recruiterRabbitMqClient.produce({recruiterId},operation);
            return res.json(response);
        } catch (error) {
            console.error("Error blocking/unblocking recruiter", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getSearchedUser: async(req: Request, res: Response) => {
        try {
            const operation = 'search-user'
            const searchValue = req.query.search;
            console.log("searchValue", searchValue);
            const response = await userRabbitMqClient.produce({searchValue}, operation);
            console.log(response);
            return res.json(response);
        } catch (error) {
            console.log("Error searching user list",error);
            res.status(500).json({success: false, message: "Internal server error"});
        }
    },

    getSearchRecruiter: async(req: Request, res: Response) => {
        try {
            const operation = 'search-recruiter';
            const searchValue = req.query.search;
            const response = await recruiterRabbitMqClient.produce({searchValue}, operation);
            return res.json(response);
        } catch (error) {
            console.log("Error seaching recruiter list", error);
            res.status(500).json({success: false, message: "Internal server error"})
        }
    },

    getReportPost: async(req: Request, res:Response)=>{
        try {
            const { page = 1, limit = 2, sortOrder  } = req.query;
            const operation = 'get-reported-post';
            const response = await postRabbitMqClient.produce({page,limit,sortOrder},operation);
            return res.json(response);
        } catch (error) {
            console.log("Error fetching report post list", error);
            res.status(500).json({success: false, message: "Internal server error"})
        }
    },

    getUserReports: async(req:Request, res:Response)=>{
        try {
            const operation = 'user-reports'
            const response = await userRabbitMqClient.produce({},operation);
            return res.json(response);
        } catch (error) {
            console.log("Error fetching users for reposts", error);
            res.status(500).json({success: false, message: "Internal server error"})
        }
    },

    getAllPostsReport: async(req:Request, res:Response)=>{
        try {
            const operation = 'post-for-reports';
            const response = await postRabbitMqClient.produce({},operation);
            return res.json(response);
        } catch (error) {
            console.log("Error fetching posts for reposts", error);
            res.status(500).json({success: false, message: "Internal server error"})
        }
    },

    getAllJobPost: async(req:Request, res:Response)=>{
        try {
            const operation = 'jobpost-for-reports';
            const response = await postRabbitMqClient.produce({},operation);
            return res.json(response);
        } catch (error) {
            console.log("Error fetching job posts for reposts", error);
            res.status(500).json({success: false, message: "Internal server error"})
        }
    },

    getBlockedUsers: async(req:Request, res:Response)=>{
        try {
            const operation = 'blocked-user-reports';
            const response = await userRabbitMqClient.produce({},operation);
            return res.json(response);
        } catch (error) {
            console.log("Error fetching blocked user for reposts", error);
            res.status(500).json({success: false, message: "Internal server error"})
        }
    },

    getBlockedRecruiter: async (req:Request, res:Response)=>{
        try {
            const operation = 'blocked-recruiter-report';
            const response = await recruiterRabbitMqClient.produce({},operation);
            return res.json(response);
        } catch (error) {
            console.log("Error fetching blocked recruiter for reposts", error);
            res.status(500).json({success: false, message: "Internal server error"})
        }
    },

    clearReports: async(req:Request, res:Response)=>{
        try {            
            const postId = req.query.postId;            
            if(!postId){
                return res.status(400).json({ error: "PostId is missing" });
              }
              const operation = 'clear-reports';
              const response = await postRabbitMqClient.produce({postId}, operation);
              return res.json(response);
        } catch (error) {
            console.log("Error clearing reports from post", error);
            res.status(500).json({success: false, message: "Internal server error"})
        }
    }
}