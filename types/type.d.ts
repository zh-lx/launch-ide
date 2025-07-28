export type Editor = 'appcode' | 'atom' | 'atom-beta' | 'brackets' | 'code' | 'code-insiders' | 'codebuddy' | 'codium' | 'comate' | 'cursor' | 'colin' | 'emacs' | 'goland' | 'hbuilder' | 'idea' | 'notepad' | 'phpstorm' | 'pycharm' | 'trae' | 'rider' | 'rubymine' | 'sublime' | 'vim' | 'webstorm' | 'windsurf' | 'zed';
export type Platform = 'darwin' | 'linux' | 'win32';
export type EDITOR_PROCESS_MAP = {
    [key in Editor]?: string[];
};
export type IDEOpenMethod = 'reuse' | 'new' | 'auto';
