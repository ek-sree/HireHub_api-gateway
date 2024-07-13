import { Request, Response } from "express";
import postRabbitMqClient from './rabbitMQ/client';

export const postController ={
 addPost: async(req: Request, res: Response)=>{
    try {
        const userId = req.query.userId;
        const {text} = req.body;
        const images = req.files;
        if(!userId){
            return res.status(400).json({ error: "UserId is missing" });
        }
        console.log("Is anything here??",userId,text,images);
        const operation = 'create-post'
        const response = await postRabbitMqClient.produce({userId,text,images},operation)
        res.status(200).json(response);
    } catch (error) {
        console.log("Error occured while creating new post",error);
        res.status(500).json({ error: "error occure creating new post" });
    }
 },

 getPosts: async(req:Request, res:Response)=>{
    try {
        
    } catch (error) {
        console.log("Error occured while creating new post",error);
        res.status(500).json({ error: "error occure creating new post" });
    }
 }
}