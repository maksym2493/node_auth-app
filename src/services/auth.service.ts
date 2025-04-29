import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { jwt } from '../utils/jwt.js';
import { mailer } from '../utils/mailer.js';
import { ApiError } from '../exceptions/api.error.js';
import { NormalizedUser } from '../types/NormalizedUser.js';

import { User } from '@prisma/client';
import { userService } from './user.service.js';
import { userRepository } from '../entity/user.repository.js';
import { refreshTokenRepository } from '../entity/refreshToken.repository.js';

async function login(email: string, password: string): Promise<NormalizedUser> {
  const user = await userRepository.getByEmail(email);

  if (!user) {
    throw ApiError.unauthorized('Invalid credentials', {
      email: 'User not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid credentials', {
      password: 'Invalid password',
    });
  }

  if (user.activationToken) {
    throw ApiError.unauthorized('Account is not activated');
  }

  return userService.normalize(user);
}

async function register(
  name: string,
  email: string,
  password: string,
): Promise<NormalizedUser> {
  const errors = {
    name: userService.validateName(name),
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const existedUser = await userRepository.getByEmail(email);

  if (existedUser) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const activationToken = crypto.randomBytes(32).toString('hex');

  await mailer.sendActivationLink(email, activationToken);

  const user = await userRepository.create(
    name,
    email,
    hashedPassword,
    activationToken,
  );

  return userService.normalize(user);
}

async function activate(
  email: string,
  activationToken: string,
): Promise<NormalizedUser> {
  const user = await userRepository.getByEmail(email);

  if (!user || user.activationToken !== activationToken) {
    throw ApiError.notFound();
  }

  const activatedUser = await userRepository.activate(email);

  return userService.normalize(activatedUser);
}

async function refresh(refreshToken: string): Promise<NormalizedUser> {
  const extractedData = jwt.validateRefreshToken(refreshToken) as
    | NormalizedUser
    | undefined;

  if (!refreshToken || !extractedData) {
    throw ApiError.unauthorized('Invalid token');
  }

  const user = await userRepository.getByEmail(extractedData.email);

  if (!user) {
    throw ApiError.unauthorized('Invalid token');
  }

  return userService.normalize(user);
}

async function logout(refreshToken: string) {
  const userData = jwt.validateRefreshToken(refreshToken) as
    | NormalizedUser
    | undefined;

  if (userData) {
    await refreshTokenRepository.deleteByUserId(userData.id);
  }
}

export const authService = {
  login,
  logout,
  refresh,
  register,
  activate,
};
