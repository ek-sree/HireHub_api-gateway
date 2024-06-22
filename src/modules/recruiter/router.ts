import express from 'express';
import { recruiterController } from './recruiterController';

const recruiterRouter = express.Router();


recruiterRouter.post('/register', recruiterController.register);
recruiterRouter.post('/otp', recruiterController.otp);
recruiterRouter.post('/resend-otp', recruiterController.resendOtp);
recruiterRouter.post('/login', recruiterController.login);
recruiterRouter.post('/logout', recruiterController.logout)

recruiterRouter.get('/getrecruiters', recruiterController.getrecruiters)


export { recruiterRouter }