import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import os from 'os';
import chalk from 'chalk';
import type {
  Editor,
  EDITOR_PROCESS_MAP,
  IDEOpenMethod,
  LaunchType,
} from './type';
import { getArguments, getEditorBasenameByProcessName } from './get-args';
import { guessEditor } from './guess';
import { getEnvVariable } from './utils';
import { EDITORS_OPEN_MAP } from './editor-info/mac';
import {
  getJetBrainsWorkspace,
  isJetBrainsEditor,
  usesJetBrainsNewCli,
} from './jetbrains';

function isTerminalEditor(editor: string) {
  switch (editor) {
    case 'vim':
    case 'emacs':
    case 'nano':
      return true;
  }
  return false;
}

function getEnvFormatPath(rootDir: string) {
  const codeInspectorFormatPath = getEnvVariable(
    'CODE_INSPECTOR_FORMAT_PATH',
    rootDir,
  );
  if (codeInspectorFormatPath) {
    try {
      return JSON.parse(codeInspectorFormatPath);
    } catch (error) {
      return null;
    }
  }

  return null;
}

function printInstructions(fileName: any, errorMessage: string | any[] | null) {
  console.log(
    chalk.red('Could not open ' + path.basename(fileName) + ' in the editor.'),
  );
  if (errorMessage) {
    if (errorMessage[errorMessage.length - 1] !== '.') {
      errorMessage += '.';
    }
    console.log(
      chalk.red('The editor process exited with an error: ' + errorMessage),
    );
  }
  console.log(
    'To set up the editor integration, add something like ' +
      chalk.cyan('CODE_EDITOR=code') +
      ' to the ' +
      chalk.green('.env.local') +
      ' file in your project folder,' +
      ' or add ' +
      chalk.green('editor: "code"') +
      ' to CodeInspectorPlugin config, ' +
      'and then restart the development server. Learn more: ' +
      chalk.green('https://goo.gl/MMTaZt'),
  );
}

let _childProcess:
  | {
      kill: (arg0: string) => void;
      on: (
        arg0: string,
        arg1: { (errorCode: any): void; (error: any): void },
      ) => void;
    }
  | any
  | null = null;

function getOpenWindowParams(ideOpenMethod?: IDEOpenMethod) {
  if (ideOpenMethod === 'reuse') {
    return '-r';
  } else if (ideOpenMethod === 'new') {
    return '-n';
  } else {
    return '';
  }
}

function spawnEditor(editor: string, args: string[]) {
  const env = {
    ...process.env,
    NODE_OPTIONS: '',
  };

  if (process.platform === 'win32') {
    // These two funcs are from launch-editor and handle shell metacharacters.
    const escapeCmdArgs = (cmdArg: string) =>
      cmdArg.replace(/([&|<>,;=^])/g, '^$1');
    const doubleQuoteIfNeeded = (value: string) => {
      if (value.includes('^')) return `^"${value}^"`;
      if (value.includes(' ')) return `"${value}"`;
      return value;
    };
    const launchCommand = [editor, ...args.map(escapeCmdArgs)]
      .map(doubleQuoteIfNeeded)
      .join(' ');

    return child_process.exec(launchCommand, {
      // @ts-ignore
      shell: true,
      env,
    });
  }

  return child_process.spawn(editor, args, {
    stdio: 'ignore',
    env,
  });
}

interface LaunchIDEParams {
  file: string;
  line?: number;
  column?: number;
  editor?: Editor;
  method?: IDEOpenMethod;
  format?: string | string[];
  onError?: (file: string, error: string) => void;
  rootDir?: string;
  workspace?: string;
  usePid?: boolean;
  type?: LaunchType;
}

export function launchIDE(params: LaunchIDEParams) {
  let {
    file,
    line = 1,
    column = 1,
    editor: _editor,
    method,
    format,
    onError,
    rootDir,
    workspace: workspacePath,
    usePid,
    type = 'exec',
  } = params;
  if (!fs.existsSync(file)) {
    return;
  }

  let [editor, ...args] = guessEditor(_editor, rootDir, usePid);
  const initialArgs = args.filter((arg): arg is string => arg !== null);
  let fallbackArgs: string[] | null = null;

  // 获取 path format
  const pathFormat = getEnvFormatPath(rootDir || '') || format;

  if (!editor || editor.toLowerCase() === 'none') {
    if (typeof onError === 'function') {
      onError(file, 'Failed to recognize IDE automatically');
    } else {
      console.log(
        'Failed to recognize IDE automatically, add something like ' +
          chalk.cyan('CODE_EDITOR=code') +
          ' to the ' +
          chalk.green('.env.local') +
          ' file in your project folder,' +
          ' or add ' +
          chalk.green('editor: "code"') +
          ' to CodeInspectorPlugin config, ' +
          'and then restart the development server. Learn more: ' +
          chalk.green('https://goo.gl/MMTaZt'),
      );
    }
    return;
  }
  const editorCommand = editor;

  const editorBasename = getEditorBasenameByProcessName(
    editor,
  ) as keyof EDITOR_PROCESS_MAP;
  if (
    (type === 'open' || type === 'open-bg') &&
    process.platform === 'darwin' &&
    EDITORS_OPEN_MAP[editorBasename]
  ) {
    // `-g` opens the URL via Launch Services without activating the target
    // app, so the editor jumps to the file but the user's current window
    // keeps focus. macOS-only; ignored on other platforms.
    const url = `${EDITORS_OPEN_MAP[editorBasename]}://file${file}:${line}:${column}`;
    const openArgs = type === 'open-bg' ? ['-g', url] : [url];
    _childProcess = child_process.spawn('open', openArgs, {
      stdio: 'ignore',
      env: {
        ...process.env,
        NODE_OPTIONS: '',
      },
    });
  } else {
    if (
      process.platform === 'linux' &&
      file.startsWith('/mnt/') &&
      /Microsoft/i.test(os.release())
    ) {
      // Assume WSL / "Bash on Ubuntu on Windows" is being used, and
      // that the file exists on the Windows file system.
      // `os.release()` is "4.4.0-43-Microsoft" in the current release
      // build of WSL, see: https://github.com/Microsoft/BashOnWindows/issues/423#issuecomment-221627364
      // When a Windows editor is specified, interop functionality can
      // handle the path translation, but only if a relative path is used.
      file = path.relative('', file);
    }

    const useJetBrainsNewCli = usesJetBrainsNewCli(editor);
    let workspace =
      workspacePath || (useJetBrainsNewCli ? getJetBrainsWorkspace(file) : null);
    if (
      workspace &&
      process.platform === 'linux' &&
      workspace.startsWith('/mnt/') &&
      /Microsoft/i.test(os.release())
    ) {
      workspace = path.relative('', workspace);
    }
    if (line) {
      if (isJetBrainsEditor(editorBasename)) {
        fallbackArgs = initialArgs.concat([
          file,
          '--line',
          String(line),
          '--column',
          String(column),
        ]);
      }
      args = args.concat(
        getArguments({
          editorBasename,
          fileName: file,
          lineNumber: line,
          colNumber: column,
          workspace,
          openWindowParams: getOpenWindowParams(method),
          pathFormat,
        }),
      );
    } else {
      args.push(file);
    }

    if (_childProcess && isTerminalEditor(editor)) {
      // There's an existing editor process already and it's attached
      // to the terminal, so go kill it. Otherwise two separate editor
      // instances attach to the stdin/stdout which gets confusing.
      _childProcess.kill('SIGKILL');
    }

    _childProcess = spawnEditor(editor, args as string[]);
  }

  const reportError = (errorMessage: string) => {
    if (typeof onError === 'function') {
      onError(file, errorMessage);
    } else {
      printInstructions(file, errorMessage);
    }
  };

  const watchChildProcess = (childProcess: any) => {
    let settled = false;

    const handleFailure = (errorMessage: string) => {
      if (settled) return;
      settled = true;

      if (fallbackArgs) {
        const retryArgs = fallbackArgs;
        fallbackArgs = null;
        _childProcess = spawnEditor(editorCommand, retryArgs);
        watchChildProcess(_childProcess);
        return;
      }

      reportError(errorMessage);
    };

    childProcess.on('exit', function (errorCode: string | number | null) {
      if (_childProcess === childProcess) _childProcess = null;
      if (errorCode) {
        handleFailure('(code ' + errorCode + ')');
      } else {
        settled = true;
      }
    });

    childProcess.on('error', function (error: { message: string }) {
      handleFailure(error.message);
    });
  };

  watchChildProcess(_childProcess);
}

export * from './type';
export { formatOpenPath } from './get-args';
export { getEnvVariable, getEnvVariables } from './utils';
