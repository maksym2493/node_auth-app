import jsonwebtoken from 'jsonwebtoken';
import { NormalizedUser } from '../types/NormalizedUser.js';

const JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY as string;
const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY as string;

function generateAccessToken(normilizedUser: NormalizedUser) {
  return jsonwebtoken.sign(normilizedUser, JWT_ACCESS_KEY, {
    expiresIn: '10m',
  });
}

function verifyAccessToken(accessToken: string) {
  try {
    return jsonwebtoken.verify(accessToken, JWT_ACCESS_KEY);
  } catch (_) {}
}

function generateRefreshToken(normilizedUser: NormalizedUser) {
  return jsonwebtoken.sign(normilizedUser, JWT_REFRESH_KEY, {
    expiresIn: '7d',
  });
}

function verifyRefreshToken(accessToken: string) {
  try {
    return jsonwebtoken.verify(accessToken, JWT_REFRESH_KEY);
  } catch (_) {}
}

export const jwt = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
