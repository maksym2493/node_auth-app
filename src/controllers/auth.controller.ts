import { RequestHandler, Response } from 'express';

import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';

import { userRepository } from '../entity/user.repository.js';
import { tokenRepository } from '../entity/token.repository.js';

import { jwt } from '../utils/jwt.js';
import { NormalizedUser } from '../types/NormalizedUser.js';
import { TokenType } from '@prisma/client';
import { tokenService } from '../services/token.service.js';

const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const name = (req.body.name || '').trim();

  await authService.register(name, email, password);

  res.json({ message: 'OK' });
};

const activate: RequestHandler = async (req, res) => {
  const { activationToken } = req.params;
  const normalizedUser = await authService.activate(activationToken);

  await sendAuthentication(res, normalizedUser);
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const normalizedUser = await authService.login(email, password);

  await sendAuthentication(res, normalizedUser);
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const normalizedUser = await authService.refresh(refreshToken);

  await sendAuthentication(res, normalizedUser);
};

const logout: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';

  await authService.logout(refreshToken);

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

async function sendAuthentication(
  res: Response,
  normalizedUser: NormalizedUser,
) {
  const accessToken = tokenService.generateAccessToken(normalizedUser);
  const refreshToken = tokenService.generateRefreshToken(normalizedUser);

  await tokenService.deleteByuserId(normalizedUser.id, TokenType.refresh);
  await tokenService.create(normalizedUser.id, refreshToken, TokenType.refresh);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.json({
    message: 'OK',

    accessToken,
    user: normalizedUser,
  });
}

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
};
