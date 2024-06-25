import express from 'express';
import { adminController } from '../user/adminController';
import authencticateToken from '../../middleware/authMiddleware';

const adminRouter = express.Router();

adminRouter.post('/login', adminController.loging);
adminRouter.get('/getalluser', authencticateToken, adminController.getUser);
adminRouter.get('/getrecruiters', authencticateToken, adminController.getRecruiter);
adminRouter.put('/blockuser/:userId', authencticateToken, adminController.blockUser);
adminRouter.put('/blockRecruiter/:recruiterId', authencticateToken, adminController.blockRecruiter)

export { adminRouter };