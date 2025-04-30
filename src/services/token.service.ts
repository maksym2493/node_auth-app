import crypto from 'crypto';
import { Token, TokenType } from '@prisma/client';
import { tokenRepository } from '../entity/token.repository.js';
import { NormalizedUser } from '../types/NormalizedUser.js';
import { jwt } from '../utils/jwt.js';

function generate(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(normalizedUser: NormalizedUser): string {
  return jwt.generateAccessToken(normalizedUser);
}

function generateRefreshToken(normalizedUser: NormalizedUser): string {
  return jwt.generateRefreshToken(normalizedUser);
}

function create(
  userId: string,
  token: string,
  tokenType: TokenType,
): Promise<Token> {
  return tokenRepository.create(userId, hashToken(token), tokenType);
}

function getByToken(
  token: string,
  tokenType: TokenType,
): Promise<Token | null> {
  return tokenRepository.getByToken(hashToken(token), tokenType);
}

function getByUserId(
  userId: string,
  tokenType: TokenType,
): Promise<Token | null> {
  return tokenRepository.getByUserId(userId, tokenType);
}

function deleteById(id: number): Promise<Token> {
  return tokenRepository.deleteById(id);
}

function deleteByuserId(userId: string, tokenType: TokenType) {
  return tokenRepository.deleteByUserId(userId, tokenType);
}

export const tokenService = {
  generate,
  generateAccessToken,
  generateRefreshToken,

  create,

  getByToken,
  getByUserId,

  deleteById,
  deleteByuserId,
};
