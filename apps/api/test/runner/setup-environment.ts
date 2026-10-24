import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  override: true,
  path: resolve(currentDirectory, '..', '..', '.env.test'),
  quiet: true,
});
