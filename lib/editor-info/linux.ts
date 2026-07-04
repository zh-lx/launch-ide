import { EDITOR_PROCESS_MAP } from '../type';

export const EDITOR_PROCESS_MAP_LINUX: EDITOR_PROCESS_MAP = {
  kiro: ['kiro'],
  antigravity: ['antigravity'],
  webstorm: ['webstorm', 'webstorm.sh'],
  cursor: ['cursor'],
  devin: ['devin'],
  windsurf: ['windsurf'],
  trae: ['trae'],
  comate: ['comate'],
  qoder: ['qoder'],
  codebuddy: ['codebuddy'],
  code: ['code'],
  'code-insiders': ['code-insiders'],
  atom: ['atom'],
  hbuilder: ['hbuilderx', 'hbuilderx.sh'],
  phpstorm: ['phpstorm', 'phpstorm.sh'],
  pycharm: ['pycharm', 'pycharm.sh'],
  idea: ['idea', 'idea.sh'],
  codium: ['vscodium'],
  goland: ['goland'],
  brackets: ['Brackets'],
  rider: ['rider'],
  rubymine: ['rubymine', 'rubymine.sh'],
  sublime: ['sublime_text'],
  vim: ['vim'],
  emacs: ['emacs'],
  zed: ['zed'],
};

const commonEditorsLinux: { [key: string]: string } = {};
Object.entries(EDITOR_PROCESS_MAP_LINUX).forEach(([editor, processes]) => {
  for (let process of processes) {
    commonEditorsLinux[process] = editor;
  }
});
export const COMMON_EDITORS_LINUX = {
  ...commonEditorsLinux,
  vscodium: 'vscodium',
  codium: 'codium',
  hbuilderx: 'hbuilderx',
  'hbuilderx.sh': 'hbuilderx',
  gvim: 'gvim',
  sublime_text: 'subl',
};
