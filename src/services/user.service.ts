import crypto from 'crypto';
import bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { NormalizedUser } from '../types/NormalizedUser.js';
import { userRepository } from '../entity/user.repository.js';

import { mailer } from '../utils/mailer.js';
import { ApiError } from '../exceptions/api.error.js';

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

async function register(
  name: string,
  email: string,
  password: string,
): Promise<NormalizedUser> {
  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
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

  return normalize(user);
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

  return normalize(activatedUser);
}

export const userService = {
  register,
  activate,
  normalize,
};
