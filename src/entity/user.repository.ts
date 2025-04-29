import { db } from '../utils/db.js';
import { User } from '@prisma/client';

function getByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email } });
}

function create(
  name: string,
  email: string,
  password: string,
  activationToken: string,
): Promise<User> {
  return db.user.create({ data: { name, email, password, activationToken } });
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

function activate(email: string): Promise<User> {
  return db.user.update({
    where: { email },
    data: { activationToken: null },
  });
}

export const userRepository = {
  create,
  getByEmail,
  activate,
  changeName,
  changePassword,
};
