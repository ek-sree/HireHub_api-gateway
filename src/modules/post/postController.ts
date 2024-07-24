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

interface CommentData {
  UserId: string;
  content: string;
  createdAt: Date;
}

interface PostWithComments {
  _id: string;
  UserId: string;
  comments: CommentData[];
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
      console.log("images",images);
      
      if (!userId) {
        return res.status(400).json({ error: "UserId is missing" });
      }
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
      const result = (await postRabbitMqClient.produce({page},operation)) as RabbitMQResponse<Post[]>;

      if (result.success && Array.isArray(result.data)) {
        const userIds = [...new Set(result.data.map((post) => post.UserId))];

        const userOperation = "get-user-details-for-post";
        const userResponse = (await userRabbitMqClient.produce({ userIds },userOperation)) as RabbitMQResponse<User[]>;

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
      const UserId = req.query.UserId;
      
      if(!postId || !UserId){
        return res.status(400).json({ error: "UserId or PostId missing" });
      }
      const operation = 'like-post';
      const response = await postRabbitMqClient.produce({postId,UserId},operation);
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
  },

  addComment: async (req: Request, res: Response) => {
    try {
      const postId = req.query.postId as string;
      const UserId = req.query.userId as string;
      const { newComment } = req.body;
      
      if (!postId || !newComment || !UserId) {
        return res.status(400).json({ error: "PostId, userId, or comment is missing" });
      }
  
      const operation = 'add-comments';
      const result = await postRabbitMqClient.produce({ postId, UserId, comments: newComment }, operation) as RabbitMQResponse<PostWithComments[]>;
  
      if (result.success && Array.isArray(result.data)) {
        const userIds = [...new Set(result.data.map((post) => post.UserId))];
  
        const userOperation = "get-user-details-for-post";
        const userResponse = await userRabbitMqClient.produce({ userIds }, userOperation) as RabbitMQResponse<User[]>;
  
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
          res.status(200).json({
            success: true,
            data: combinedData,
            message: "Posts fetched, but user data not available",
          });
        }
      } else {
        res.status(404).json({ success: false, message: "No posts found" });
      }
    } catch (error) {
      console.error("Error occurred while adding comment", error);
      res.status(500).json({ error: "Error occurred while adding comment" });
    }
  },
  

  fetchComment: async(req:Request, res:Response)=>{
    try {
      const postId = req.query.postId;
      
      if(!postId){
        return res.status(400).json({ error: "UserId or PostId missing" });
      }
      const operation = 'fetch-comment';
      const result = await postRabbitMqClient.produce({postId},operation)as RabbitMQResponse<PostWithComments[]>;;
      if (result.success && Array.isArray(result.data)) {
        const userIds = [...new Set(result.data.map((post) => post.UserId))];
  
        const userOperation = "get-user-details-for-post";
        const userResponse = await userRabbitMqClient.produce({ userIds }, userOperation) as RabbitMQResponse<User[]>;
  
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
          res.status(200).json({
            success: true,
            data: combinedData,
            message: "Posts fetched, but user data not available",
          });
        }
      } else {
        res.status(404).json({ success: false, message: "No posts found" });
      }
    } catch (error) {
      console.error("Error occurred while commenting posts", error);
      res.status(500).json({ error: "Error occurred while commenting users posts" });
    }
  },

  deleteComment: async(req: Request, res:Response)=>{
    try {
      const id = req.query.commentId;
      const postId = req.query.postId;
      
      if(!id || !postId){
        return res.status(400).json({ error: "commentId or postId were missing" });
      }
      const operation = 'delete-comment';
      
      const response = await postRabbitMqClient.produce({id,postId},operation);
      return res.json(response);
    } catch (error) {
      console.error("Error occurred while deleting comment", error);
      res.status(500).json({ error: "Error occurred while deleting comment" });
    }
  },

  deletePost: async (req: Request, res: Response) => {
    try {
        const postId = req.query.postId;
        const imageUrl = req.query.imageUrl;

        if (!postId || !imageUrl) {
            return res.status(400).json({ error: "PostId or imageUrl were missing" });
        }

        const operation = 'delete-post';
        const response = await postRabbitMqClient.produce({ postId, imageUrl }, operation);
        return res.json(response);
    } catch (error) {
        console.error("Error occurred while deleting post", error);
        res.status(500).json({ error: "Error occurred while deleting post" });
    }
},

reportPost: async(req:Request, res: Response)=>{
  try {
    const UserId = req.query.UserId;
    const postId = req.query.postId;
    const reason = req.body.reason;
    
    if(!UserId || !postId || !reason){
      return res.status(400).json({ error: "PostId, UserId or reason were missing" });
    }
    const operation = 'report-post'
    const response = await postRabbitMqClient.produce({UserId, postId, reason}, operation);
    return res.json(response);
  } catch (error) {
    console.error("Error occurred while reporting post", error);
        res.status(500).json({ error: "Error occurred while reporting post" });
    }
},

updatePost: async(req:Request, res:Response)=>{
  try {
      const postId = req.params;
      const description = req.body.description;
      console.log("update post id", postId,description);
      
      if(!postId || !description){
        return res.status(400).json({ error: "PostId is missing" });
      }
      const operation = 'update-post';
      const response = await postRabbitMqClient.produce({postId,description}, operation);
      return res.json(response);
  } catch (error) {
      console.log("Error editing user posts", error);
      res.status(500).json({success: false, message: "Internal server error"})
  }
}

};
