import express from 'express';
import config from './config';
import { userRouter } from './modules/user/routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser()) 
app.use(cors({
    origin: true,
    credentials: true 
  }));

app.use(express.json());
  
app.use('/', userRouter)


const serverStart = async()=>{
    try {
        console.log(`user-service running on port ${config.user_port}`);
        console.log(`recruiter-service running on port ${config.recruiter_port}`);
        
        const port = config.port;
        app.listen(port,()=>{
            console.log(`server is running on ${port}`);
            
        })
    } catch (error) {
        
    }
}

serverStart()

