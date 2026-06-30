import { Editor, EDITOR_PROCESS_MAP } from '../type';

export const EDITOR_PROCESS_MAP_OSX: EDITOR_PROCESS_MAP = {
  kiro: ['/Kiro.app/Contents/MacOS/Electron', '/Kiro.app/Contents/MacOS/Kiro'],
  cursor: ['/Cursor.app/Contents/MacOS/Cursor'],
  comate: [
    '/Comate.app/Contents/MacOS/Electron',
    '/Comate.app/Contents/MacOS/Comate',
  ],
  qoder: [
    '/Qoder.app/Contents/MacOS/Electron',
    '/Qoder CN.app/Contents/MacOS/Electron',
    '/Qoder.app/Contents/MacOS/Qoder',
    '/Qoder CN.app/Contents/MacOS/Qoder',
  ],
  windsurf: [
    '/Windsurf.app/Contents/MacOS/Electron',
    '/Windsurf.app/Contents/MacOS/Windsurf',
  ],
  trae: [
    '/Trae.app/Contents/MacOS/Electron',
    '/Trae CN.app/Contents/MacOS/Electron',
    '/Trae.app/Contents/MacOS/Trae',
    '/Trae CN.app/Contents/MacOS/Trae',
  ],
  codebuddy: [
    '/Applications/CodeBuddy.app/Contents/MacOS/Electron',
    '/Applications/CodeBuddy CN.app/Contents/MacOS/Electron',
    '/Applications/CodeBuddy.app/Contents/MacOS/CodeBuddy',
    '/Applications/CodeBuddy CN.app/Contents/MacOS/CodeBuddy',
  ],
  antigravity: [
    '/Antigravity.app/Contents/MacOS/Electron',
    '/Antigravity.app/Contents/MacOS/Antigravity',
  ],
  code: [
    '/Visual Studio Code.app/Contents/MacOS/Electron',
    '/Visual Studio Code.app/Contents/MacOS/Code',
  ],
  'code-insiders': [
    '/Visual Studio Code - Insiders.app/Contents/MacOS/Electron',
  ],
  webstorm: ['/WebStorm.app/Contents/MacOS/webstorm'],
  atom: [
    '/Atom.app/Contents/MacOS/Atom',
    '/Atom Beta.app/Contents/MacOS/Atom Beta',
  ],
  hbuilder: ['/HBuilderX.app/Contents/MacOS/HBuilderX'],
  phpstorm: ['/PhpStorm.app/Contents/MacOS/phpstorm'],
  pycharm: ['/PyCharm.app/Contents/MacOS/pycharm'],
  idea: ['/IntelliJ IDEA.app/Contents/MacOS/idea'],
  codium: ['/VSCodium.app/Contents/MacOS/Electron'],
  goland: ['/GoLand.app/Contents/MacOS/goland'],
  colin: ['/CLion.app/Contents/MacOS/clion'],
  appcode: ['/AppCode.app/Contents/MacOS/appcode'],
  'atom-beta': ['/Atom Beta.app/Contents/MacOS/Atom Beta'],
  brackets: ['/Brackets.app/Contents/MacOS/Brackets'],
  rider: ['/Rider.app/Contents/MacOS/rider'],
  rubymine: ['/RubyMine.app/Contents/MacOS/rubymine'],
  sublime: ['/Sublime Text.app/Contents/MacOS/sublime_text'],
  zed: ['/Zed.app/Contents/MacOS/zed'],
};

const commonEditorMac: { [key: string]: string } = {};
for (let processes of Object.values(EDITOR_PROCESS_MAP_OSX)) {
  for (let process of processes) {
    commonEditorMac[process] = process;
  }
}
export const COMMON_EDITORS_OSX = {
  ...commonEditorMac,
  '/Sublime Text.app/Contents/MacOS/Sublime Text':
    '/Sublime Text.app/Contents/SharedSupport/bin/subl',
  '/Sublime Text.app/Contents/MacOS/sublime_text':
    '/Sublime Text.app/Contents/SharedSupport/bin/subl',
  '/Sublime Text 2.app/Contents/MacOS/Sublime Text 2':
    '/Sublime Text 2.app/Contents/SharedSupport/bin/subl',
  '/Sublime Text Dev.app/Contents/MacOS/Sublime Text':
    '/Sublime Text Dev.app/Contents/SharedSupport/bin/subl',
  '/MacVim.app/Contents/MacOS/MacVim': 'mvim',
};

export const EDITORS_OPEN_MAP: Partial<
  Record<keyof EDITOR_PROCESS_MAP, string>
> = {
  kiro: 'kiro',
  cursor: 'cursor',
  comate: 'comate',
  qoder: 'qoder',
  windsurf: 'windsurf',
  trae: 'trae',
  codebuddy: 'codebuddy',
  antigravity: 'antigravity',
  code: 'vscode',
  codium: 'vscodium',
  zed: 'zed',
};

export const Force_Open_List: Editor[] = ['zed'];
