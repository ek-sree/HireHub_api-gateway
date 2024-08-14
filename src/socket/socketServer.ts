import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import messageRabbitMqClient from '../modules/message/rabbitMQ/client';
import logger from '../utils/logger';
import postRabbitMqClient from '../modules/post/rabbitMQ/client';
import userRabbitMqClient from '../modules/user/rabbitMQ/client';

interface User {
  id: any;
  _id: string;
}

interface RabbitMQResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface LikeNotificationResult {
  success: boolean;
  data?: {
    userId: string;
    postId: string;
    likedBy: string;
    notification: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  message?: string;
}

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const onlineUsers = new Map<string, string>(); 

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('userConnected', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
      console.log('Current online users:', Array.from(onlineUsers.entries()));
    });

    socket.on('joinConversation', (chatId) => {
      socket.join(chatId);
      logger.info('User joined conversation', { chatId, socketId: socket.id });
    });

    socket.on('sendMessage', async (message) => {
      const { chatId, content, images, video, record, recordDuration, senderId, receiverId } = message;
      try {
        const operation = 'save-message';
        const response = await messageRabbitMqClient.produce({ chatId, content, images, video, record, recordDuration, senderId, receiverId }, operation);
        if (response && typeof response === 'object') {
          io.to(chatId).emit('newMessage', { ...message, ...response });
        } else {
          io.to(chatId).emit('newMessage', message);
        }
      } catch (error) {
        logger.error('Error sending message to RabbitMQ', { error });
        socket.emit('messageSendError', { error: 'Failed to save message' });
      }
    });

    socket.on('likeNotification', async (data) => {
      console.log("like notification any??", data);

      const { userId, postId, likedBy } = data;
      try {
        const operation = 'like-notification';
        const result = await postRabbitMqClient.produce({ userId, postId, likedBy }, operation) as LikeNotificationResult;
        console.log("result", result);
        if (result && typeof result === 'object' && 'success' in result) {
          const userOperation = "get-user-details-for-post";
          const userResponse = await userRabbitMqClient.produce({ userIds: [userId] }, userOperation) as RabbitMQResponse<User[]>;

          let likedByUser = null;
          if (userResponse.success && Array.isArray(userResponse.data) && userResponse.data.length > 0) {
            likedByUser = userResponse.data[0];
          }

          const newNotification = {
            ...result.data,
            user: likedByUser
          };
          console.log("New notification", newNotification);

          io.emit('newNotification', newNotification); 
        } else {
          console.error('Failed to process like notification:', result);
          socket.emit('notificationError', { error: 'Failed to process notification' });
        }
      } catch (error) {
        logger.error('Error sending like notification to RabbitMQ', { error });
        socket.emit('messageSendError', { error: 'Failed to save message' });
      }
    });

    // Video call
    socket.on('callUser', ({ userToCall, from, offer, fromId }) => {
      console.log('CallUser event received:', { userToCall, from, offer, fromId });
      io.emit('incomingCall', { from: fromId, callerName: from, offer });
    });

    socket.on('signal', (data) => {
      const { userId, type, candidate, answer, context } = data;
      if (context === 'webRTC') {
        io.emit('signal', { type, candidate, answer, userId }); 
      }
    });

    socket.on('callAccepted', ({ userId, answer, context, acceptedBy }) => {
      if (context === 'webRTC') {
        io.emit('callAcceptedSignal', { answer, context, userId, acceptedBy }); 
      }
    });

    socket.on('callEnded', (guestId) => {
      io.emit('callEndedSignal');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
};

export const emitUserStatus = (userId: string, isOnline: boolean) => {
  if (io) {
    io.emit('userStatusChanged', { userId, isOnline });
  } else {
    logger.error('Socket.io not initialized');
  }
};
