import bcrypt from 'bcrypt';

import { jwt } from '../utils/jwt.js';
import { mailer } from '../utils/mailer.js';
import { ApiError } from '../exceptions/api.error.js';

import { TokenType } from '@prisma/client';
import { NormalizedUser } from '../types/NormalizedUser.js';

import { userService } from './user.service.js';
import { userRepository } from '../entity/user.repository.js';
import { tokenRepository } from '../entity/token.repository.js';
import { tokenService } from './token.service.js';

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
  const activationToken = tokenService.generate();
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await mailer.sendActivationLink(email, activationToken);

  const user = await userRepository.create(name, email, hashedPassword);

  await tokenService.create(user.id, activationToken, TokenType.activation);

  return userService.normalize(user);
}

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

  const token = await tokenService.getByUserId(user.id, TokenType.activation);

  if (token) {
    throw ApiError.unauthorized('Account is not activated');
  }

  return userService.normalize(user);
}

async function activate(activationToken: string): Promise<NormalizedUser> {
  const token = await tokenService.getByToken(
    activationToken,
    TokenType.activation,
  );

  if (!token) {
    throw ApiError.notFound();
  }

  await tokenService.deleteById(token.id);
  const activatedUser = await userRepository.get(token.userId);

  if (!activatedUser) {
    throw ApiError.notFound();
  }

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
    await tokenRepository.deleteByUserId(userData.id, TokenType.refresh);
  }
}

export const authService = {
  login,
  logout,
  refresh,
  register,
  activate,
};
