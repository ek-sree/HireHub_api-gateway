import { Request, Response } from "express";
import postRabbitMqClient from "./rabbitMQ/client";
import userRabbitMqClient from "../../modules/user/rabbitMQ/client";

interface Post {
  _id: string;
  UserId: string;
}

interface User {
  id: any;
  _id: string;
}

interface RabbitMQResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const postController = {
  addPost: async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId;
      const { text } = req.body;
      const images = req.files;
      if (!userId) {
        return res.status(400).json({ error: "UserId is missing" });
      }
      console.log("Is anything here??", userId, text, images);
      const operation = "create-post";
      const response = await postRabbitMqClient.produce(
        { userId, text, images },
        operation
      );
      res.status(200).json(response);
    } catch (error) {
      console.log("Error occured while creating new post", error);
      res.status(500).json({ error: "error occure creating new post" });
    }
  },

  getAllPosts: async (req: Request, res: Response) => {
    try {
      const operation = "get-all-posts";
      const page = req.query.page;
      const result = (await postRabbitMqClient.produce(
        {page},
        operation
      )) as RabbitMQResponse<Post[]>;

      if (result.success && Array.isArray(result.data)) {
        const userIds = [...new Set(result.data.map((post) => post.UserId))];

        const userOperation = "get-user-details-for-post";
        const userResponse = (await userRabbitMqClient.produce(
          { userIds },
          userOperation
        )) as RabbitMQResponse<User[]>;

        if (userResponse.success && Array.isArray(userResponse.data)) {
          const userMap = new Map(
            userResponse.data.map((user) => [user.id, user])
          );

          const combinedData = result.data.map((post) => {
            const user = userMap.get(post.UserId);
            return { ...post, user: user || null };
          });

          res.status(200).json({ success: true, data: combinedData });
        } else {
          const combinedData = result.data.map((post) => ({
            ...post,
            user: null,
          }));
          res
            .status(200)
            .json({
              success: true,
              data: combinedData,
              message: "Posts fetched, but user data not available",
            });
        }
      } else {
        res.status(404).json({ success: false, message: "No posts found" });
      }
    } catch (error) {
      console.error("Error occurred while fetching posts", error);
      res.status(500).json({ error: "Error occurred while fetching posts" });
    }
  },

  getUserPosts: async(req:Request, res:Response)=>{
    try {
      const userId = req.query.userId;
      console.log("userIDdddd",userId);
      
      if(!userId){
        return res.status(400).json({ error: "UserId is missing" });
      }
      const operation = 'fetch-user-posts';
      const response = await postRabbitMqClient.produce({userId}, operation);
      return res.json(response);
    } catch (error) {
      console.error("Error occurred while fetching users posts", error);
      res.status(500).json({ error: "Error occurred while fetching users posts" });
    }
  },

  likePost: async(req:Request, res: Response)=>{
    try {
      const postId = req.query.postId;
      const userId = req.query.userId;
      if(!postId || !userId){
        return res.status(400).json({ error: "UserId or PostId missing" });
      }
      const operation = 'like-post';
      const response = await postRabbitMqClient.produce({postId,userId},operation);
      return res.json(response);
    } catch (error) {
      console.error("Error occurred while liking posts", error);
      res.status(500).json({ error: "Error occurred while liking users posts" });
    }
  },

  unlikePost: async(req:Request, res:Response)=>{
    try {
      const postId = req.query.postId;
      const userId = req.query.userId;
      if(!postId || !userId){
        return res.status(400).json({ error: "UserId or PostId missing" });
      }
      const operation = 'unlike-post';
      const response = await postRabbitMqClient.produce({postId,userId},operation);
      return res.json(response);
    } catch (error) {
      console.error("Error occurred while unliking posts", error);
      res.status(500).json({ error: "Error occurred while unliking users posts" });
    }
  }
};
