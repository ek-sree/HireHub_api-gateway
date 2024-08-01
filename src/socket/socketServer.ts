import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import messageRabbitMqClient from '../modules/message/rabbitMQ/client';
import logger from '../utils/logger';
import postRabbitMqClient from '../modules/post/rabbitMQ/client'
import userRabbitMqClient from '../modules/user/rabbitMQ/client'


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
    logger.info('User connected', { socketId: socket.id });

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


    //notification

    socket.on('joinRoom', (userId) => {
      console.log(`User ${userId} joining room`);
      socket.join(userId);
      console.log(`User ${userId} joined room successfully`);
    });

    socket.on('likeNotification', async(data)=>{
      console.log("like notification any??",data);
      
      const {userId, postId, likedBy}=data;
      try {
        const operation = 'like-notification'
        const result = await postRabbitMqClient.produce({userId, postId, likedBy},operation) as LikeNotificationResult;
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

          io.to(userId).emit('newNotification', newNotification);
        } else {
          console.error('Failed to process like notification:', result);
          socket.emit('notificationError', { error: 'Failed to process notification' });
        }
      } catch (error) {
        logger.error('Error sending like notifiaction to RabbitMQ', { error });
        socket.emit('messageSendError', { error: 'Failed to save message' });
      }
    })


    // Video call
    socket.on('userOnline', (userId: string) => {
      console.log('User came online:', userId, 'Socket ID:', socket.id);
      onlineUsers.set(userId, socket.id);
    });

    socket.on('callUser', ({ userToCall, from, offer, fromId }) => {
      console.log(`Received callUser event. userToCall: ${userToCall}, from: ${from}, fromId: ${fromId}`);
      console.log('Current online users:', Array.from(onlineUsers.entries()));
      const userSocketId = onlineUsers.get(userToCall);
      if (userSocketId) {
        console.log(`Emitting incomingCall event to socket ${userSocketId}`);
        io.to(userSocketId).emit('incomingCall', { from, offer, fromId });
      } else {
        console.log(`User ${userToCall} not found in onlineUsers map`);
      }
    });

    socket.on('callAccepted', (data) => {
      console.log('Call accepted', data);
      const { userId, answer, context } = data;
      if (context === 'webRTC') {
        const userSocketId = onlineUsers.get(userId);
        if (userSocketId) {
          console.log(`Forwarding callAccepted to user ${userId}`);
          io.to(userSocketId).emit('signal', { type: 'answer', answer });
        } else {
          console.log(`User ${userId} not found for callAccepted`);
        }
      }
    });

    socket.on('callEnded', (guestId) => {
      let userSocketId = onlineUsers.get(guestId) || '';
      io.to(userSocketId).emit('callEndedSignal');
    });

    socket.on('disconnect', () => {
      logger.info('User disconnected', { socketId: socket.id });
      // Remove the disconnected user from the onlineUsers map
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
