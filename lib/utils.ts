import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

export function getEnvVariables(rootDir: string): Record<string, string> {
  // get variable from process.env
  if (process.env) {
    return process.env as Record<string, string>;
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
    return envConfig;
  }

  return {};
}

export function getEnvVariable(
  variable: string,
  rootDir: string
): string | null {
  const envVariables = getEnvVariables(rootDir);
  return envVariables[variable] || null;
}

/**
 * check if command exists
 * @param {string} command - the command to check
 * @returns {boolean} true if command exists, false otherwise
 */
export function commandExists(command: string): boolean {
  try {
    // Use 'which' command on Unix-like systems (Linux, macOS)
    // Use 'where' command on Windows
    const platform = process.platform;
    const checkCommand = platform === 'win32' ? 'where' : 'which';

    const result = execSync(`${checkCommand} ${command}`, {
      encoding: 'utf-8',
      stdio: 'ignore'
    });
    return !!result;
  } catch (error) {
    return false;
  }
}
