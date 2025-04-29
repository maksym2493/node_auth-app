import bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { ApiError } from '../exceptions/api.error.js';
import { NormalizedUser } from '../types/NormalizedUser.js';

import { authService } from './auth.service.js';
import { userRepository } from '../entity/user.repository.js';

type ValidationResult = string | undefined;

function validateName(name: string): ValidationResult {
  if (!name) return 'Name is required';
  if (name.length < 6) return 'At least 6 characters';
}

function validateEmail(email: string): ValidationResult {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) return 'Email is required';
  if (!emailPattern.test(email)) return 'Email is not valid';
}

function validatePassword(password: string): ValidationResult {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'At least 6 characters';
}

function normalize({ id, name, email }: User): NormalizedUser {
  return { id, name, email };
}

async function changeName(
  { email, name }: User,
  newName: string,
): Promise<NormalizedUser> {
  if (name === newName) {
    throw ApiError.badRequest('Invalid name', {
      newNme: 'The current name is the same as the new one',
    });
  }

  const newUser = await userRepository.changeName(email, newName);

  return normalize(newUser);
}

async function changePassword(
  user: User,

  password: string,
  newPassword: string,
  passwordConfirmation: string,
): Promise<NormalizedUser> {
  const validationError = userService.validatePassword(newPassword);

  if (validationError) {
    throw ApiError.badRequest('Invalid credentials', {
      newPassword: validationError,
    });
  }

  if (newPassword !== passwordConfirmation) {
    throw ApiError.badRequest('Invalid credentials', {
      passwordConfirmation:
        'Password confirmation does not match the new password',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid credentials', {
      password: 'The current password you entered is incorrect',
    });
  }

  if (password === newPassword) {
    throw ApiError.badRequest('Invalid credentials', {
      newPassword: 'The new password must be different from the current one',
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const newUser = await userRepository.changePassword(
    user.email,
    hashedPassword,
  );

  return userService.normalize(newUser);
}

export const userService = {
  normalize,
  validateName,
  validateEmail,
  validatePassword,

  changeName,
  changePassword,
};
