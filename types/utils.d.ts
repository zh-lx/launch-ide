export declare function getEnvVariables(rootDir: string): Record<string, string>;
export declare function getEnvVariable(variable: string, rootDir: string): string | null;
/**
 * check if command exists
 * @param {string} command - the command to check
 * @returns {boolean} true if command exists, false otherwise
 */
export declare function commandExists(command: string): boolean;
