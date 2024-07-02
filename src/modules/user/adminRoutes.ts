import express from 'express';
import { adminController } from '../user/adminController';
import authencticateToken from '../../middleware/authMiddleware';

const adminRouter = express.Router();

adminRouter.post('/login', adminController.loging);
adminRouter.get('/getalluser', authencticateToken, adminController.getUser);
adminRouter.get('/getVerifiedRecruiter', authencticateToken, adminController.getVerifiedRecruiter);
adminRouter.put('/verifyRecruiter/:recruiterId', authencticateToken, adminController.verifyRecruiter)
adminRouter.get('/getrecruiters', authencticateToken, adminController.getRecruiter);
adminRouter.put('/blockuser/:userId', authencticateToken, adminController.blockUser);
adminRouter.put('/blockRecruiter/:recruiterId', authencticateToken, adminController.blockRecruiter);
adminRouter.get('/searchUser', authencticateToken, adminController.getSearchedUser);
adminRouter.get('/searchRecruiter', authencticateToken, adminController.getSearchRecruiter);

export { adminRouter };