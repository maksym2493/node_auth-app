import bcrypt from 'bcrypt';

import { ApiError } from '../exceptions/api.error.js';
import { NormalizedUser } from '../types/NormalizedUser.js';

import { userService } from './user.service.js';
import { userRepository } from '../entity/user.repository.js';

async function login(email: string, password: string): Promise<NormalizedUser> {
  const user = await userRepository.getByEmail(email);

  if (!user) {
    throw ApiError.unauthorized('Authentication failed', {
      email: 'User not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Authentication failed', {
      password: 'Invalid password',
    });
  }

  if (user.activationToken) {
    throw ApiError.unauthorized('Account is not activated');
  }

  return userService.normalize(user);
}

export const authService = { login };
