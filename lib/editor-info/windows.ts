import { EDITOR_PROCESS_MAP } from "../type";

// 有顺序优先级
export const COMMON_EDITORS_WIN: { [key: string]: string } = {
  'Cursor.exe': '',
  'Windsurf.exe': '',
  'Trae.exe': '',
  'Trae CN.exe': '',
  'Code.exe': '',
  'Code - Insiders.exe': '',
  'VSCodium.exe': '',
  'webstorm.exe': '',
  'webstorm64.exe': '',
  'HBuilderX.exe': '',
  'HBuilderX64.exe': '',
  'HBuilder.exe': '',
  'HBuilder64.exe': '',
  'Brackets.exe': '',
  'atom.exe': '',
  'sublime_text.exe': '',
  'notepad++.exe': '',
  'clion.exe': '',
  'clion64.exe': '',
  'idea.exe': '',
  'idea64.exe': '',
  'phpstorm.exe': '',
  'phpstorm64.exe': '',
  'pycharm.exe': '',
  'pycharm64.exe': '',
  'rubymine.exe': '',
  'rubymine64.exe': '',
  'goland.exe': '',
  'goland64.exe': '',
  'rider.exe': '',
  'rider64.exe': '',
};

export const EDITOR_PROCESS_MAP_WIN: EDITOR_PROCESS_MAP = {
  code: ['Code.exe'],
  'code-insiders': ['Code - Insiders.exe'],
  webstorm: ['webstorm.exe', 'webstorm64.exe'],
  cursor: ['Cursor.exe'],
  windsurf: ['Windsurf.exe'],
  trae: ['Trae.exe', 'Trae CN.exe'],
  atom: ['atom.exe'],
  hbuilder: ['HBuilderX.exe', 'HBuilder.exe', 'HBuilderX64.exe', 'HBuilder64.exe'],
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
}