import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { authController } from '../controllers/auth.controller.js';

export const authRoute = Router();

authRoute.post('/registration', authController.register);
authRoute.get('/activation/:email/:activationToken', authController.activate);

authRoute.post('/login', authController.login);
authRoute.post('/logout', authController.logout);
authRoute.get('/refresh', cookieParser(), authController.refresh);
