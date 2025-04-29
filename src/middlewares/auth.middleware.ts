import { ApiError } from '../exceptions/api.error.js';
import { NextFunction, Request, Response } from 'express';
import { jwt } from '../utils/jwt.js';

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    throw ApiError.unauthorized('Token is required');
  }

  const userData = jwt.verifyAccessToken(accessToken);

  if (!userData) {
    throw ApiError.unauthorized('Invalid token');
  }

  next();
}
