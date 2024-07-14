import express from 'express';
import { userController } from './userController';
import authencticateToken from '../../middleware/authMiddleware';
import upload from '../../multer/multer';


const userRouter = express.Router();


userRouter.post("/register",userController.register )
userRouter.post('/otp', userController.otp)
userRouter.post('/resend-otp', userController.resendOtp);
userRouter.post('/login', userController.login);
userRouter.post('/google-login', userController.loginWithGoogle);
userRouter.post('/logout', userController.logout);
userRouter.post('/addtitle',authencticateToken, userController.addTitleProfile);
userRouter.post('/editdetails', authencticateToken, userController.editDetails);
userRouter.get('/viewDetails', authencticateToken, userController.viewDetails);
userRouter.get('/userInfo', authencticateToken, userController.userInfo);
userRouter.post('/userInfoEdit', authencticateToken, userController.userEditInfo);
userRouter.post('/addUserSkills', authencticateToken, userController.userSkillsAdd);
userRouter.get('/userskills', authencticateToken, userController.usersSkills);
userRouter.post('/editSkills', authencticateToken, userController.userSkillsEdit);
userRouter.post('/addCv', authencticateToken, upload.single('cv'), userController.addCv)
userRouter.get('/getCv', authencticateToken, userController.fetchCv);
userRouter.delete('/deleteCv', authencticateToken, userController.deleteCv);
userRouter.post('/addProfileImg', authencticateToken,upload.single('image'), userController.addProfile);
userRouter.get('/getProfileImages', authencticateToken, userController.getProfileImages);
userRouter.post('/addCoverPhoto', authencticateToken, upload.single('image'), userController.addCoverImg);
userRouter.get('/getCoverImage', authencticateToken, userController.getCoverImg);

export { userRouter }
