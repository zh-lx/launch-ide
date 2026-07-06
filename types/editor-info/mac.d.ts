import { EDITOR_PROCESS_MAP } from '../type';
export declare const EDITOR_PROCESS_MAP_OSX: EDITOR_PROCESS_MAP;
export declare const COMMON_EDITORS_OSX: {
    '/Sublime Text.app/Contents/MacOS/Sublime Text': string;
    '/Sublime Text.app/Contents/MacOS/sublime_text': string;
    '/Sublime Text 2.app/Contents/MacOS/Sublime Text 2': string;
    '/Sublime Text Dev.app/Contents/MacOS/Sublime Text': string;
    '/MacVim.app/Contents/MacOS/MacVim': string;
    '/Zed.app/Contents/MacOS/zed': string;
};
export declare const EDITORS_OPEN_MAP: Partial<Record<keyof EDITOR_PROCESS_MAP, string>>;
