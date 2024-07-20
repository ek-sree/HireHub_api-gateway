import express from 'express';
import authencticateToken from '../../middleware/authMiddleware';
import upload from '../../multer/multer';
import { postController } from './postController';

const postRouter = express.Router();

postRouter.post('/addPost', authencticateToken, upload.array('images'), postController.addPost);
postRouter.get('/getPosts', authencticateToken, postController.getAllPosts);
postRouter.get('/userPosts', authencticateToken, postController.getUserPosts);
postRouter.post('/likePost', authencticateToken, postController.likePost);
postRouter.post('/unlikePost', authencticateToken, postController.unlikePost);
postRouter.post('/addComment', authencticateToken, postController.addComment);
postRouter.get('/viewComments', authencticateToken, postController.fetchComment);
postRouter.delete('/deleteComment', authencticateToken, postController.deleteComment);
postRouter.delete('/deletePost', authencticateToken, postController.deletePost);
postRouter.post('/reportPost', authencticateToken, postController.reportPost);

export {postRouter}