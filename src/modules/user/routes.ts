import express from 'express';
import { userController } from './userController';
import authencticateToken from '../../middleware/authMiddleware';


const userRouter = express.Router();


userRouter.post("/register",userController.register )
userRouter.post('/otp', userController.otp)
userRouter.post('/resend-otp', userController.resendOtp);
userRouter.post('/login', userController.login);
userRouter.post('/google-login', userController.loginWithGoogle);
userRouter.post('/logout', userController.logout);
userRouter.post('/addtitle',authencticateToken, userController.addTitleProfile)




export { userRouter }
