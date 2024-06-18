import express from 'express';
import { adminController } from './adminController';

const adminRouter = express.Router();

adminRouter.post('/login', adminController.login);


export { adminRouter };