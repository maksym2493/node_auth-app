import { RequestHandler, Response } from 'express';

import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';

import { userRepository } from '../entity/user.repository.js';
import { refreshTokenRepository } from '../entity/refreshToken.repository.js';

import { jwt } from '../utils/jwt.js';
import { NormalizedUser } from '../types/NormalizedUser.js';

const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const name = (req.body.name || '').trim();

  await authService.register(name, email, password);

  res.json({ message: 'OK' });
};

const activate: RequestHandler = async (req, res) => {
  const { email, activationToken } = req.params;
  const normalizedUser = await authService.activate(email, activationToken);

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
  const accessToken = jwt.generateAccessToken(normalizedUser);
  const refreshToken = jwt.generateRefreshToken(normalizedUser);

  await refreshTokenRepository.deleteByUserId(normalizedUser.id);
  await refreshTokenRepository.create(normalizedUser.id, refreshToken);

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
