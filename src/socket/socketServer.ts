import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import messageRabbitMqClient from '../modules/message/rabbitMQ/client';
import logger from '../utils/logger';

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
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
      console.log("socket messages for upload111111",message);
      
      const { chatId, content,images, senderId, receiverId } = message;
      try {
        const operation = 'save-message';
        const response = await messageRabbitMqClient.produce({ chatId, content,images, senderId, receiverId }, operation);
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
