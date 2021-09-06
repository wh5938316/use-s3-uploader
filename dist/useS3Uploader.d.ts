import { Target } from './utils/dom';
declare type Fn = (...args: any) => any;
export declare type Options = {
    getSignedUrl: Fn;
    preprocess: Fn;
    onSignedUrl: Fn;
    onProgress: Fn;
    onFinish: Fn;
    onError: Fn;
    signingUrl: string;
    signingUrlMethod: string;
    signingUrlHeaders: Object | Fn;
};
declare const useS3Uploader: (options: any, inputRef: Target) => void;
export default useS3Uploader;
