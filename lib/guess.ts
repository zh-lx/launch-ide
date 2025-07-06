import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import dotenv from 'dotenv';
import { Platform, Editor } from './type';
import { COMMON_EDITOR_PROCESS_MAP, COMMON_EDITORS_MAP } from './editor-info';

const ProcessExecutionMap = {
  darwin: 'ps ax -o comm=',
  linux: 'ps -eo comm --sort=comm',
  // wmic's performance is better, but window11 not build in
  win32: 'wmic process where "executablepath is not null" get executablepath',
};

// powershell's compatibility is better
const winExecBackup =
  'powershell -NoProfile -Command "Get-CimInstance -Query \\"select executablepath from win32_process where executablepath is not null\\" | % { $_.ExecutablePath }"';

export function guessEditor(_editor?: Editor): Array<string | null> {
  let customEditors: string[] | null = null;

  // webpack
  if (process.env.CODE_EDITOR) {
    const editor = getEditorByCustom(process.env.CODE_EDITOR as any);
    if (editor) {
      customEditors = editor;
    } else {
      return [process.env.CODE_EDITOR];
    }
  }

  // vite
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath) && !customEditors) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const envConfig = dotenv.parse(envFile || '');
    if (envConfig.CODE_EDITOR) {
      const editor = getEditorByCustom(envConfig.CODE_EDITOR as any);
      if (editor) {
        customEditors = editor;
      } else {
        return [envConfig.CODE_EDITOR];
      }
    }
  }

  if (_editor && !customEditors) {
    const editor = getEditorByCustom(_editor);
    if (editor) {
      customEditors = editor;
    }
  }

  // Try to get editor from PID tracing first
  const editorFromPid = getEditorCommandByPid();
  if (editorFromPid && !customEditors) {
    return [editorFromPid];
  }

  try {
    let first: string[] | undefined;

    const platform = process.platform as 'darwin' | 'linux' | 'win32';
    const isWin32 = process.platform === 'win32';

    const execution = ProcessExecutionMap[platform];
    const commonEditors = COMMON_EDITORS_MAP[platform];

    compatibleWithChineseCharacter(isWin32);

    let output = '';
    try {
      output = child_process.execSync(execution, { encoding: 'utf-8' });
    } catch (error) {
      if (isWin32) {
        output = child_process.execSync(winExecBackup, { encoding: 'utf-8' });
      }
    }

    const editorNames = Object.keys(commonEditors);
    const runningProcesses = output
      .split(isWin32 ? '\r\n' : '\n')
      .map((item) => item.trim());

    for (let i = 0; i < editorNames.length; i++) {
      const editorName = editorNames[i] as keyof typeof commonEditors;
      let editor: string = ''; // 要返回的 editor 结果
      let runningEditor: string = ''; // 正在运行的 editor 进程名称

      // 检测当前 editorName 是否正在运行
      if (isWin32) {
        const processPath = runningProcesses.find(
          (_process) => path.basename(_process) === editorName
        );
        if (processPath) {
          runningEditor = path.basename(processPath);
          editor = processPath;
        }
      } else if (platform === 'darwin') {
        const runningProcess = runningProcesses.find((_process) =>
          _process.endsWith(editorName)
        );
        // 命中了 IDE
        if (runningProcess) {
          const prefixPath = runningProcess.replace(editorName, '');
          const processName = commonEditors[editorName] as string;
          runningEditor = editorName;
          if (processName.includes('/')) {
            // 使用 应用进程 路径
            editor = `${prefixPath}${processName}`;
          } else {
            // 使用 CLI 路径
            editor = processName;
          }
        }
      } else {
        if (output.indexOf(editorName) !== -1) {
          runningEditor = editorName;
          editor = commonEditors[editorName];
        }
      }

      if (runningEditor && editor) {
        if (customEditors?.includes(runningEditor)) {
          // 优先返回用户自定义的 editor
          return [editor];
        }
        if (!first) {
          first = [editor];
        }
      }
    }

    if (first) {
      return first;
    }
  } catch (error) {
    // Ignore...
  }

  if (process.env.VISUAL) {
    return [process.env.VISUAL];
  } else if (process.env.EDITOR) {
    return [process.env.EDITOR];
  }

  return [null];
}

// 用户指定了 IDE 时，优先走此处
const getEditorByCustom = (editor: Editor): string[] | null => {
  const platform = process.platform as Platform;
  return (
    (COMMON_EDITOR_PROCESS_MAP[platform] &&
      COMMON_EDITOR_PROCESS_MAP[platform][editor]) ||
    null
  );
};

// 兼容中文编码
const compatibleWithChineseCharacter = (isWin32: boolean): void => {
  if (isWin32) {
    // 兼容 windows 系统 powershell 中文乱码问题
    try {
      child_process.execSync('chcp 65001');
    } catch (error) {
      // ignore errors
    }
  }
};

// Normally, we start the service via a command in the IDE's terminal,
// so we can trace up from the current PID to find the IDE that launched this service.
function getEditorCommandByPid(): string | null {
  const platform = process.platform as 'darwin' | 'linux' | 'win32';
  const commonEditorKeys = Object.keys(COMMON_EDITORS_MAP[platform]);

  try {
    return traceProcessTree(process.pid, platform, commonEditorKeys);
  } catch (error) {
    console.error('Error while getting editor by PID:', error);
    return null;
  }
}

function traceProcessTree(
  startPid: number,
  platform: string,
  commonEditorKeys: string[]
): string | null {
  let currentPid = startPid;
  let depth = 0;
  const MAX_DEPTH = 50; // Prevent infinite loops
  const ROOT_PID = 0;

  while (currentPid && currentPid !== ROOT_PID && depth < MAX_DEPTH) {
    const processInfo = getProcessInfo(currentPid, platform);
    if (!processInfo) break;

    const { command, parentPid } = processInfo;

    if (isKnownEditor(command, commonEditorKeys)) {
      return command;
    }

    currentPid = parentPid;
    depth++;
  }

  return null;
}

// Get process info based on platform
function getProcessInfo(pid: number, platform: string): ProcessInfo | null {
  switch (platform) {
    case 'darwin':
    case 'linux':
      return getUnixProcessInfo(pid);
    case 'win32':
      return getWindowsProcessInfo(pid);
    default:
      return null;
  }
}

// Get process info for Unix-like systems (macOS and Linux)
function getUnixProcessInfo(pid: number): ProcessInfo | null {
  try {
    const processInfo = child_process.execSync(`ps -p ${pid} -o ppid=,comm=`, {
      encoding: 'utf8',
    });
    const lines = processInfo.trim().split('\n');
    if (!lines.length) return null;

    return parseUnixProcessLine(lines[0].trim());
  } catch {
    return null;
  }
}

// Get process info for Windows (with fallback)
function getWindowsProcessInfo(pid: number): ProcessInfo | null {
  return getWindowsProcessInfoWmic(pid) || getWindowsProcessInfoPowerShell(pid);
}

// Get process info for Windows using wmic
function getWindowsProcessInfoWmic(pid: number): ProcessInfo | null {
  try {
    // Ensure UTF-8 encoding for Chinese character compatibility
    compatibleWithChineseCharacter(true);

    const processInfo = child_process.execSync(
      `wmic process where "ProcessId=${pid}" get ParentProcessId,ExecutablePath /format:csv`,
      { encoding: 'utf8' }
    );
    const lines = processInfo
      .trim()
      .split('\r\n')
      .filter((line) => line.trim()) // Remove empty lines
      .slice(1); // Skip the first line (CSV header)

    if (lines.length === 0) return null;

    // Node,ExecutablePath,ParentProcessId
    const parts = lines[0].split(',');
    if (parts.length < 3) return null;

    return {
      command: parts[1].trim(),
      parentPid: parseInt(parts[2].trim()),
    };
  } catch {
    return null;
  }
}

// Get process info for Windows using PowerShell
function getWindowsProcessInfoPowerShell(pid: number): ProcessInfo | null {
  try {
    // Ensure UTF-8 encoding for Chinese character compatibility
    compatibleWithChineseCharacter(true);

    const processInfo = child_process.execSync(
      `powershell -NoProfile -Command "Get-CimInstance -Query \"select ParentProcessId,ExecutablePath from win32_process where ProcessId=${pid}\" | ForEach-Object { $_.ExecutablePath + ',' + $_.ParentProcessId }"`,
      { encoding: 'utf8' }
    );
    const line = processInfo.trim();
    if (!line) return null;

    const parts = line.split(',');
    if (parts.length < 2) return null;

    return {
      command: parts[0].trim(),
      parentPid: parseInt(parts[1].trim()),
    };
  } catch {
    return null;
  }
}

// Process information interface
interface ProcessInfo {
  command: string;
  parentPid: number;
}

// Parse process line for Unix-like systems (macOS and Linux)
function parseUnixProcessLine(processLine: string): ProcessInfo | null {
  const match = processLine.match(/^(\d+)\s+(.+)$/);
  if (!match) return null;

  return {
    command: match[2],
    parentPid: parseInt(match[1]),
  };
}

// Check if command matches any known editor
function isKnownEditor(command: string, commonEditorKeys: string[]): boolean {
  return commonEditorKeys.some((key) => command.endsWith(key));
}
