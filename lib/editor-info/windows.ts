import { EDITOR_PROCESS_MAP } from '../type';

export const EDITOR_PROCESS_MAP_WIN: EDITOR_PROCESS_MAP = {
  kiro: ['Kiro.exe'],
  antigravity: ['Antigravity.exe'],
  webstorm: ['webstorm.exe', 'webstorm64.exe'],
  cursor: ['Cursor.exe'],
  windsurf: ['Windsurf.exe'],
  trae: ['Trae.exe', 'Trae CN.exe'],
  comate: ['comate.exe'],
  qoder: ['Qoder.exe', 'Qoder CN.exe'],
  codebuddy: ['CodeBuddy.exe', 'CodeBuddy CN.exe'],
  code: ['Code.exe'],
  'code-insiders': ['Code - Insiders.exe'],
  atom: ['atom.exe'],
  hbuilder: [
    'HBuilderX.exe',
    'HBuilder.exe',
    'HBuilderX64.exe',
    'HBuilder64.exe',
  ],
  phpstorm: ['phpstorm.exe', 'phpstorm64.exe'],
  pycharm: ['pycharm.exe', 'pycharm64.exe'],
  idea: ['idea.exe', 'idea64.exe'],
  codium: ['VSCodium.exe'],
  goland: ['goland.exe', 'goland64.exe'],
  colin: ['clion.exe', 'clion64.exe'],
  brackets: ['Brackets.exe'],
  rider: ['rider.exe', 'rider64.exe'],
  rubymine: ['rubymine.exe', 'rubymine64.exe'],
  sublime: ['sublime_text.exe'],
  notepad: ['notepad++.exe'],
  zed: ['zed.exe'],
};

const commonEditorWins: { [key: string]: string } = {};
for (let processes of Object.values(EDITOR_PROCESS_MAP_WIN)) {
  for (let process of processes!) {
    commonEditorWins[process] = '';
  }
}
export const COMMON_EDITORS_WIN = commonEditorWins;
