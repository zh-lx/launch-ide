import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export function getEnvVariable(
  variable: string,
  rootDir: string
): string | null {
  // get variable from process.env
  if (process.env[variable]) {
    return process.env[variable] as string;
  }

  // get variable from .env.local
  let envPath = '';
  if (rootDir) {
    const _envPath = path.resolve(rootDir, '.env.local');
    if (fs.existsSync(_envPath)) {
      envPath = _envPath;
    }
  }
  if (!envPath) {
    const _envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(_envPath)) {
      envPath = _envPath;
    }
  }

  if (envPath) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const envConfig = dotenv.parse(envFile || '');
    return envConfig[variable];
  }

  return null;
}
