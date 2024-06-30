import express from 'express';
import config from './config';
import { userRouter } from './modules/user/routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { recruiterRouter } from './modules/recruiter/router';
import { adminRouter } from './modules/user/adminRoutes';
import { jobpostRoutet } from './modules/post/jobpostroute';

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

app.use(cookieParser()) 


app.use(express.json());
  
app.use('/', userRouter);
app.use('/recruiter', recruiterRouter);
app.use('/admin', adminRouter);
app.use('/recruiter/jobpost',jobpostRoutet);


const serverStart = async()=>{
    try {
        console.log(`user-service running on port ${config.user_port}`);
        console.log(`recruiter-service running on port ${config.recruiter_port}`);
        console.log(`admin-service running on port ${config.admin_port}`);
        
        const port = config.port;
        app.listen(port,()=>{
            console.log(`server is running on ${port}`);
            
        })
    } catch (error) {
        
    }
}

serverStart()

