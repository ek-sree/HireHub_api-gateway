import express from 'express';
import config from './config';
import http from 'http';
import { userRouter } from './modules/user/routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { recruiterRouter } from './modules/recruiter/router';
import { adminRouter } from './modules/user/adminRoutes';
import { jobpostRoutet } from './modules/post/jobpostroute';
import { postRouter } from './modules/post/postRouter';
import { messageRouter } from './modules/message/messageRouter';
import { initializeSocket } from './socket/socketServer';
import logger from './utils/logger';

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use('/', userRouter);
app.use('/recruiter', recruiterRouter);
app.use('/admin', adminRouter);
app.use('/recruiter/jobpost', jobpostRoutet);
app.use('/post', postRouter);
app.use('/message', messageRouter);

const server = http.createServer(app);
initializeSocket(server);

const serverStart = async () => {
  try {
    logger.info(`user-service running on port ${config.user_port}`);
    logger.info(`recruiter-service running on port ${config.recruiter_port}`);
    logger.info(`admin-service running on port ${config.admin_port}`);
    logger.info(`message-service running on port ${config.message_port}`);
    
    const port = config.port;
    server.listen(port, () => {
      logger.info(`Server is running on ${port}`);
    });
  } catch (error) {
    logger.error("Error occurred", { error });
  }
};

serverStart();
