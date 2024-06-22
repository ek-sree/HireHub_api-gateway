import express from 'express';
import { userController } from './userController';


const userRouter = express.Router();


userRouter.post("/register",userController.register )
userRouter.post('/otp', userController.otp)
userRouter.post('/resend-otp', userController.resendOtp);
userRouter.post('/login', userController.login);
userRouter.post('/google-login', userController.loginWithGoogle);
userRouter.post('/logout', userController.logout);


userRouter.get('/getalluser', userController.getUser)

export { userRouter }
