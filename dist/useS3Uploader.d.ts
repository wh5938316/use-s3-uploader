import { Target } from './utils/dom';
declare type Fn = (...args: any) => any;
export declare type Options = {
    test?: boolean;
    getSignedUrl?: Fn;
    onUploadStart?: Fn;
    onSignedUrl?: Fn;
    onProgress?: Fn;
    onFinish?: Fn;
    onError?: Fn;
    signingUrl?: string;
    signingUrlMethod?: string;
    signingUrlHeaders?: Object | Fn;
    accept?: string;
    uploadRequestHeaders?: Object;
    contentDisposition?: string;
};
declare const useS3Uploader: (options: Options, inputRef: Target) => void;
export default useS3Uploader;
