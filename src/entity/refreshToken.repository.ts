import { RefreshToken } from '@prisma/client';
import { db } from '../utils/db.js';

function create(userId: string, refreshToken: string): Promise<RefreshToken> {
  return db.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
    },
  });
}

function deleteByUserId(userId: string) {
  return db.refreshToken.deleteMany({ where: { userId } });
}

export const refreshTokenRepository = {
  create,
  deleteByUserId,
};
