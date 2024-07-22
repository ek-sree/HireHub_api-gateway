import { Request, Response } from "express";
import messageRabbitMqClient from './rabbitMQ/client';
import userRabbitMqClient from '../user/rabbitMQ/client';
import logger from "../../utils/logger";

interface Chat {
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

export const messageController = {
    getConvoUsers: async (req: Request, res: Response) => {
        try {
            const userId = req.query.userId as string;
            if (!userId) {
                return res.status(400).json({ error: "UserId is missing" });
            }
            const operation = 'convo-users';
            const result = await messageRabbitMqClient.produce({ userId }, operation) as RabbitMQResponse<Chat[]>;
            if (result.success && Array.isArray(result.data)) {
                const userIds = [...new Set(result.data.map((post) => post.UserId))];
                const userOperation = "get-user-details-for-post";
                const userResponse = await userRabbitMqClient.produce({ userIds }, userOperation) as RabbitMQResponse<User[]>;

                if (userResponse.success && Array.isArray(userResponse.data)) {
                    const userMap = new Map(userResponse.data.map((user) => [user.id, user]));
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
            logger.error("Error occurred while fetching conversation users", { error });
            res.status(500).json({ error: "Error occurred while fetching conversation users" });
        }
    },

    getChatId: async (req: Request, res: Response) => {
        try {
            const userId = req.query.userId as string;
            const recievedId = req.query.recieverId as string;
            if (!userId || !recievedId) {
                return res.status(400).json({ error: "UserId or receiver id is missing" });
            }
            const operation = 'get-chatId';
            const response = await messageRabbitMqClient.produce({ userId, recievedId }, operation);
            logger.info("Chat ID fetched", { response });
            return res.json(response);
        } catch (error) {
            logger.error("Error occurred while fetching chat ID", { error });
            res.status(500).json({ error: "Error occurred while fetching chat ID" });
        }
    },

    getMessage: async (req: Request, res: Response) => {
        try {
            const userId = req.query.userId as string;
            const recievedId = req.query.recieverId as string;
            if (!userId || !recievedId) {
                return res.status(400).json({ error: "UserId or receiver id is missing" });
            }
            const operation = 'fetch-message';
            const result = await messageRabbitMqClient.produce({ userId, recievedId }, operation) as any;

            const userIds = [recievedId];
            const userOperation = "get-user-details-for-post";
            const userResponse = await userRabbitMqClient.produce({ userIds }, userOperation) as RabbitMQResponse<User[]>;

            let responseData: { messages: any[]; user: User | null } = {
                messages: result.data,
                user: null
            };

            if (userResponse.success && Array.isArray(userResponse.data) && userResponse.data.length > 0) {
                responseData.user = userResponse.data[0];
            }

            logger.info("Messages fetched", { responseData });
            res.status(200).json({ success: true, data: responseData });
        } catch (error) {
            logger.error("Error occurred while fetching messages", { error });
            res.status(500).json({ error: "Error occurred while fetching messages" });
        }
    }
};
