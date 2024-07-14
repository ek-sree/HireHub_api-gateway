import { Request, Response } from "express";
import postRabbitMqClient from './rabbitMQ/client';
import userRabbitMqClient from '../../modules/user/rabbitMQ/client';

interface Post {
    _id: string;
    UserId: string;
    // Add other post properties
  }
  
  interface User {
    _id: string;
    // Add other user properties
  }
  
  interface RabbitMQResponse<T> {
    success: boolean;
    message: string;
    data?: T;
  }

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

 getAllPosts: async(req: Request, res: Response) => {
    try {
      const operation = 'get-all-posts';
      const result = await postRabbitMqClient.produce({}, operation) as RabbitMQResponse<Post[]>;
      console.log("i guess", result);
      
      if (result.success && Array.isArray(result.data)) {
        const userIds = result.data.map(post => post.UserId);
        
        const userOperation = 'get-user-details-for-post';
        const userResponse = await userRabbitMqClient.produce({ userIds }, userOperation) as RabbitMQResponse<User>;
        console.log("data got from user-service", userResponse);
        
        if (userResponse.success && userResponse.data) {
          const combinedData = result.data.map(post => {
            // Since we're getting a single user object, we don't need to find the user
            return { ...post, user: userResponse.data };
          });
          
          res.status(200).json({ success: true, data: combinedData });
        } else {
          // If user data is not available, we'll still return posts but without user data
          const combinedData = result.data.map(post => ({ ...post, user: null }));
          res.status(200).json({ success: true, data: combinedData, message: "Posts fetched, but user data not available" });
        }
      } else {
        res.status(404).json({ success: false, message: "No posts found" });
      }
    } catch (error) {
      console.error("Error occurred while fetching posts", error);
      res.status(500).json({ error: "Error occurred while fetching posts" });
    }
  }
}