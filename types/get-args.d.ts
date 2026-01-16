export declare function formatOpenPath(file: string, line: string | number, column: string | number, format: string | string[] | boolean): string[];
export declare function getArguments(params: {
    editorBasename: string;
    fileName: string;
    lineNumber: string | number;
    colNumber: string | number;
    workspace: string | null;
    openWindowParams: string;
    pathFormat?: string | string[];
}): string[];
export declare function getEditorBasenameByProcessName(processName: string): string;
