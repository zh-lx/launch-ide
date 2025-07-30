import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import os from 'os';
import chalk from 'chalk';
import { Editor, IDEOpenMethod } from './type';
import { getArguments } from './get-args';
import { guessEditor } from './guess';
import { getEnvVariable } from './utils';

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
    rootDir
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
    chalk.red('Could not open ' + path.basename(fileName) + ' in the editor.')
  );
  if (errorMessage) {
    if (errorMessage[errorMessage.length - 1] !== '.') {
      errorMessage += '.';
    }
    console.log(
      chalk.red('The editor process exited with an error: ' + errorMessage)
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
      chalk.green('https://goo.gl/MMTaZt')
  );
}

let _childProcess:
  | {
      kill: (arg0: string) => void;
      on: (
        arg0: string,
        arg1: { (errorCode: any): void; (error: any): void }
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

interface LaunchIDEParams {
  file: string;
  line?: number;
  column?: number;
  editor?: Editor;
  method?: IDEOpenMethod;
  format?: string | string[];
  onError?: (file: string, error: string) => void;
  rootDir?: string;
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
  } = params;
  if (!fs.existsSync(file)) {
    return;
  }

  let [editor, ...args] = guessEditor(_editor, rootDir);

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
          chalk.green('https://goo.gl/MMTaZt')
      );
    }
    return;
  }

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

  let workspace = null;
  if (line) {
    args = args.concat(
      getArguments({
        processName: editor,
        fileName: file,
        lineNumber: line,
        colNumber: column,
        workspace,
        openWindowParams: getOpenWindowParams(method),
        pathFormat,
      })
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

  if (process.platform === 'win32') {
    // this two funcs according to launch-editor
    // compatible for some special characters
    const escapeCmdArgs = (cmdArgs: string | null) => {
      return cmdArgs!.replace(/([&|<>,;=^])/g, '^$1');
    };
    const doubleQuoteIfNeeded = (str: string | null) => {
      if (str!.includes('^')) {
        return `^"${str}^"`;
      } else if (str!.includes(' ')) {
        return `"${str}"`;
      }
      return str;
    };

    const launchCommand = [editor, ...args.map(escapeCmdArgs)]
      .map(doubleQuoteIfNeeded)
      .join(' ');

    _childProcess = child_process.exec(launchCommand, {
      stdio: 'inherit',
      // @ts-ignore
      shell: true,
      env: {
        ...process.env,
        NODE_OPTIONS: '',
      },
    });
  } else {
    _childProcess = child_process.spawn(editor, args as string[], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '',
      },
    });
  }

  _childProcess.on('exit', function (errorCode: string) {
    _childProcess = null;

    if (errorCode) {
      if (typeof onError === 'function') {
        onError(file, '(code ' + errorCode + ')');
      } else {
        printInstructions(file, '(code ' + errorCode + ')');
      }
    }
  });

  _childProcess.on('error', function (error: { message: any }) {
    if (typeof onError === 'function') {
      onError(file, error.message);
    } else {
      printInstructions(file, error.message);
    }
  });
}

export * from './type';
export { formatOpenPath } from './get-args';
export { getEnvVariable } from './utils';
