import { Editor, IDEOpenMethod } from './type';
interface LaunchIDEParams {
    file: string;
    line?: number;
    column?: number;
    editor?: Editor;
    method?: IDEOpenMethod;
    format?: string | string[];
    onError?: (file: string, error: string) => void;
}
export declare function launchIDE(params: LaunchIDEParams): void;
export * from './type';
export { formatOpenPath } from './get-args';
