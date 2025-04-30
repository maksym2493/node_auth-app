import { db } from '../utils/db.js';
import { User } from '@prisma/client';

function get(id: string): Promise<User | null> {
  return db.user.findUnique({ where: { id } });
}

function getByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email } });
}

function getByResetToken(resetToken: string): Promise<User | null> {
  return db.user.findFirst({ where: { resetToken } });
}

function create(name: string, email: string, password: string): Promise<User> {
  return db.user.create({ data: { name, email, password } });
}

function changeName(email: string, newName: string) {
  return db.user.update({
    where: { email },
    data: { name: newName },
  });
}

function changePassword(email: string, newPassword: string) {
  return db.user.update({
    where: { email },
    data: { password: newPassword },
  });
}

export const userRepository = {
  get,
  getByEmail,
  getByResetToken,

  create,
  changeName,
  changePassword,
};
