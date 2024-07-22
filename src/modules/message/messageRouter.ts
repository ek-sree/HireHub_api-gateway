import express from 'express';
import authencticateToken from '../../middleware/authMiddleware';
import { messageController } from './messageController';

const messageRouter = express.Router();

messageRouter.get('/getconvodata', authencticateToken, messageController.getConvoUsers);
messageRouter.post('/createChatId', authencticateToken, messageController.getChatId);
messageRouter.get('/getmessages', authencticateToken, messageController.getMessage);

export {messageRouter}