import express from 'express';
import { userController } from './userController';


const userRouter = express.Router();


userRouter.post("/register",userController.register )
userRouter.post('/otp', userController.otp)

export { userRouter }
