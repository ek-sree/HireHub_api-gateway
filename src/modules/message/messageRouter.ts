import express from 'express';
import authencticateToken from '../../middleware/authMiddleware';
import { messageController } from './messageController';
import upload from '../../multer/multer';

const messageRouter = express.Router();

messageRouter.get('/getconvodata', authencticateToken, messageController.getConvoUsers);
messageRouter.post('/createChatId', authencticateToken, messageController.getChatId);
messageRouter.get('/getmessages', authencticateToken, messageController.getMessage);
messageRouter.post('/sendimage', authencticateToken, upload.array('images'), messageController.saveImages)

export {messageRouter}