import { hash, verify } from 'argon2';

const memoryCost = 2 ** 16;
const timeCost = 3;
const parallelism = 1;

export const generatePasswordHash = (password: string): Promise<string> =>
  hash(password, { memoryCost, parallelism, timeCost });

export const validatePasswordHash = (hashValue: string, password: string): Promise<boolean> =>
  verify(hashValue, password);
