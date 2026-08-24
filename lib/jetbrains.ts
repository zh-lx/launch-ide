import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface JetBrainsProductInfo {
  version?: string;
  buildNumber?: string;
}

const NEW_CLI_BUILD_BRANCH = 262;
const versionCache = new Map<string, boolean>();
const jetBrainsEditors = new Set([
  'appcode',
  'clion',
  'clion64',
  'idea',
  'idea64',
  'phpstorm',
  'phpstorm64',
  'pycharm',
  'pycharm64',
  'rubymine',
  'rubymine64',
  'webstorm',
  'webstorm64',
  'goland',
  'goland64',
  'rider',
  'rider64',
]);

export function isJetBrainsEditor(editorBasename: string): boolean {
  return jetBrainsEditors.has(editorBasename);
}

function getProjectRoot(): string {
  try {
    return execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return '';
  }
}

export function getJetBrainsWorkspace(file: string, workspace?: string): string {
  if (workspace) {
    const resolvedWorkspace = path.resolve(workspace);
    if (fs.existsSync(resolvedWorkspace)) return resolvedWorkspace;
  }

  const projectRoot = getProjectRoot();
  if (projectRoot) return projectRoot;

  const ancestors: string[] = [];
  let directory = path.dirname(path.resolve(file));

  while (true) {
    ancestors.push(directory);
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }

  for (const marker of ['.idea', '.git']) {
    const workspace = ancestors.find((ancestor) =>
      fs.existsSync(path.join(ancestor, marker)),
    );
    if (workspace) return workspace;
  }

  return path.dirname(path.resolve(file));
}

function resolveEditorPath(editor: string): string | null {
  const candidates = editor.includes(path.sep)
    ? [editor]
    : (process.env.PATH || '')
        .split(path.delimiter)
        .filter(Boolean)
        .map((directory) => path.join(directory, editor));

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return fs.realpathSync(candidate);
      }
    } catch {
      // Keep looking when a PATH entry or symlink cannot be resolved.
    }
  }

  return null;
}

function getProductInfoPaths(editorPath: string): string[] {
  const editorDirectory = path.dirname(editorPath);
  return [
    // macOS: <IDE>.app/Contents/MacOS/<launcher>
    path.resolve(editorDirectory, '../Resources/product-info.json'),
    // Linux/Windows: <IDE>/bin/<launcher>
    path.resolve(editorDirectory, '../product-info.json'),
  ];
}

function usesNewCli(productInfo: JetBrainsProductInfo): boolean {
  const buildBranch = Number.parseInt(productInfo.buildNumber || '', 10);
  if (!Number.isNaN(buildBranch)) {
    return buildBranch >= NEW_CLI_BUILD_BRANCH;
  }

  const version = /^(\d{4})\.(\d+)/.exec(productInfo.version || '');
  if (!version) return false;

  const year = Number(version[1]);
  const release = Number(version[2]);
  return year > 2026 || (year === 2026 && release >= 2);
}

export function usesJetBrainsNewCli(editor: string): boolean {
  const cached = versionCache.get(editor);
  if (cached !== undefined) return cached;

  const editorPath = resolveEditorPath(editor);
  if (!editorPath) {
    versionCache.set(editor, false);
    return false;
  }

  for (const productInfoPath of getProductInfoPaths(editorPath)) {
    try {
      const productInfo = JSON.parse(
        fs.readFileSync(productInfoPath, 'utf8'),
      ) as JetBrainsProductInfo;
      const result = usesNewCli(productInfo);
      versionCache.set(editor, result);
      return result;
    } catch {
      // Try the next platform-specific product-info.json location.
    }
  }

  versionCache.set(editor, false);
  return false;
}
