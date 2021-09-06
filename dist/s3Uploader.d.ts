declare type Fn = (...args: any) => any;
declare type Options = any;
declare class S3Upload {
    test: boolean;
    server: string;
    s3path: string;
    signingUrl: string;
    signingUrlMethod: string;
    successResponses: any[number];
    contentDisposition: string | null;
    uploadRequestHeaders: any;
    httprequest: any;
    signingUrlQueryParams: any;
    signingUrlHeaders: any;
    signingUrlWithCredentials: any;
    el: HTMLInputElement;
    getSignedUrl: (file: File, next: Fn) => any;
    constructor(options: Options);
    handle(files: File[]): void;
    uploadFile(file: File): any;
    uploadToS3(file: any, signResult: any): void;
    createCORSRequest(method: any, url: any, opts?: any): XMLHttpRequest;
    executeOnSignedUrl(file: any, callback: any): void;
    onFinish(signResult: any, file: any): void;
    onUploadStart(file: any, next: any): any;
    onProgress: (percent: any, status: any, file: any) => void;
    onError(status: any, file: any): void;
    onSignedUrl(result: any): void;
    scrubFilename(filename: any): any;
    abortUpload(): void;
    _getErrorRequestContext(xhr: any): {
        response: any;
        status: any;
        statusText: any;
        readyState: any;
    };
}
export default S3Upload;
