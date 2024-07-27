import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import messageRabbitMqClient from '../modules/message/rabbitMQ/client';
import logger from '../utils/logger';

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", 
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info('User connected', { socketId: socket.id });

    socket.on('joinConversation', (chatId) => {
      socket.join(chatId);
      logger.info('User joined conversation', { chatId, socketId: socket.id });
    });

    socket.on('sendMessage', async (message) => {
      const { chatId, content, images,video, senderId, receiverId } = message;
      try {
        const operation = 'save-message';
        const response = await messageRabbitMqClient.produce({ chatId, content, images,video, senderId, receiverId }, operation);
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

    socket.on('disconnect', () => {
      logger.info('User disconnected', { socketId: socket.id });
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