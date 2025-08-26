import path from 'path';
import child_process from 'child_process';
import { Platform, Editor } from './type';
import { COMMON_EDITOR_PROCESS_MAP, COMMON_EDITORS_MAP } from './editor-info';
import { getEnvVariable } from './utils';
import chalk from 'chalk';

const ProcessExecutionMap = {
  darwin: 'ps ax -o comm=',
  linux: 'ps -eo comm --sort=comm',
  win32: 'powershell -NoProfile -Command "Get-CimInstance -Query \\"select executablepath from win32_process where executablepath is not null\\" | % { $_.ExecutablePath }"',
};

export function guessEditor(
  _editor?: Editor,
  rootDir?: string,
  usePid?: boolean,
): Array<string | null> {
  let customEditors: string[] | null = null;

  const codeEditor = getEnvVariable('CODE_EDITOR', rootDir || '');
  if (codeEditor) {
    const editor = getEditorByCustom(codeEditor as any);
    if (editor) {
      customEditors = editor;
    } else {
      return [codeEditor];
    }
  }

  if (!customEditors && _editor) {
    const editor = getEditorByCustom(_editor);
    if (editor) {
      customEditors = editor;
    }
  }

  // Try to get editor from PID tracing first
  if (!customEditors && usePid) {
    const editorFromPid = getEditorCommandByPid();
    if (editorFromPid) {
      return [editorFromPid];
    }
  }

  try {
    let first: string[] | undefined;

    const platform = process.platform as 'darwin' | 'linux' | 'win32';
    const isWin32 = process.platform === 'win32';

    const execution = ProcessExecutionMap[platform];
    const commonEditors = COMMON_EDITORS_MAP[platform];

    compatibleWithChineseCharacter(isWin32);

    const output = child_process.execSync(execution, { encoding: 'utf-8' });

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
          (_process) =>
            path.basename(_process).toLowerCase() === editorName.toLowerCase()
        );
        if (processPath) {
          runningEditor = path.basename(processPath);
          editor = processPath;
        }
      } else if (platform === 'darwin') {
        const runningProcess = runningProcesses.find((_process) =>
          _process.toLowerCase().endsWith(editorName.toLowerCase())
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
// So we can trace up from the current PID to find the IDE that launched this service.
function getEditorCommandByPid(): string | null {
  const platform = process.platform as Platform;
  const editorNames = Object.keys(COMMON_EDITORS_MAP[platform]);

  try {
    return traceProcessTree(process.pid, platform, editorNames);
  } catch (error) {
    console.log(chalk.red('Error while getting editor by PID:'), error);
    return null;
  }
}

function traceProcessTree(
  pid: number,
  platform: Platform,
  editorNames: string[]
): string | null {
  let depth = 0;
  const MAX_DEPTH = 50; // Prevent infinite loops
  const ROOT_PID = 0;

  while (pid && pid !== ROOT_PID && depth < MAX_DEPTH) {
    const processInfo = getProcessInfo(pid, platform);

    if (!processInfo) break;

    const { command, parentPid } = processInfo;

    if (isKnownEditor(command, editorNames)) {
      return command;
    }

    pid = parentPid;
    depth++;
  }

  return null;
}

// Get process info based on platform
function getProcessInfo(pid: number, platform: Platform): ProcessInfo | null {
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

// Get process info for Windows
function getWindowsProcessInfo(pid: number): ProcessInfo | null {
  try {
    // Ensure UTF-8 encoding for Chinese character compatibility
    compatibleWithChineseCharacter(true);

    const execCommand = `powershell -NoProfile -Command "Get-CimInstance -ClassName Win32_Process -Filter "ProcessId=${pid}" | Select-Object ParentProcessId, ExecutablePath | ConvertTo-Csv -NoTypeInformation`;

    const processInfo = child_process.execSync(execCommand, {
      encoding: 'utf8',
    });
    const lines = processInfo
      .trim()
      .split('\r\n')
      .filter((line) => line.trim()) // Remove empty lines
      .slice(1); // Skip the first line (CSV header)

    if (lines.length === 0) return null;

    // ParentProcessId,ExecutablePath
    const [_parentPid, _command] = lines[0].split(',');
    if (!_command || !_parentPid) return null;

    return {
      command: _command.slice(1, -1),
      parentPid: Number(_parentPid.slice(1, -1)),
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

function isKnownEditor(command: string, editorNames: string[]): boolean {
  return editorNames.some((editorName) =>
    command.toLowerCase().endsWith(editorName.toLowerCase())
  );
}
