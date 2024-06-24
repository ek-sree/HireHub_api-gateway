import { Request, Response } from "express";
import { Adminclient } from "./grpc/client/grpcClient";
import { genenrateToken } from "../../jwt/jwtCreate";
import userRabbitMqClient from './rabbitMQ/client';
import recruiterRabbitMqClient from '../recruiter/rabbitMQ/client';

export const adminController = {
    
    loging:(req: Request, res: Response) => {
        console.log("admin login is getting here?");
        
        try {
            console.log("Login for admin is reached here");
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
                console.log("this is result from admin login",result);
                return res.json(result);
            })
        } catch (error) {
            console.log("Error loging in", error);
            return res.status(500).json({error: "Internal server error"});
        }
    },

    getUser: async (req: Request, res: Response) => {
        console.log("userr gettt");
        
       try {
        console.log("gettin here");
        
        const operation = 'get-all-users';
        const response = await userRabbitMqClient.produce({}, operation);
        console.log("response userget rabbitmq", response);
        return res.json(response);
       } catch (error) {
        console.log("Error fetching users", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    getRecruiter: async(req: Request, res: Response) => {
        console.log("recruiter data getting");
        try {
            console.log("recruiter getting here");
            const operation = 'get-all-recruiter';
            const response = await recruiterRabbitMqClient.produce({}, operation);
            console.log("response recruiter get rabbitMq", response);
            return res.json(response);
        } catch (error) {
            
        }
    },

    blockUser: async(req: Request, res: Response) => {
        console.log("req reach for block user");
        try {
            const operation = 'block-user'
            const { userId } = req.params;
            console.log("user id for block",userId);
            
            const response = await userRabbitMqClient.produce({userId},operation);
            console.log("response for block user", response);
            return res.json({success:true})
        } catch (error) {
            console.error("Error blocking/unblocking user", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}