import { useCallback, useEffect, useMemo } from "react";
import S3Uploader from './s3Uploader';
import { getTargetElement, Target } from './utils/dom';

type Fn = (...args: any) => any;

export type Options = {
  test?: boolean
  getSignedUrl?: Fn
  onUploadStart?: Fn
  onSignedUrl?: Fn
  onProgress?: Fn
  onFinish?: Fn
  onError?: Fn
  signingUrl?: string
  signingUrlMethod?: string
  signingUrlHeaders?: Object | Fn
  accept?: string
  uploadRequestHeaders?: Object
  contentDisposition?: string
}

const useS3Uploader = (options: Options, inputRef: Target) => {
  const s3Upload = useMemo(() => {
    const s3Uploader = new S3Uploader(options);
    if (options.test) console.log(s3Uploader);
    return s3Uploader;
  }, [options, inputRef]);

  const onFileChange = useCallback((event) => {
    const files = event.target.files || [];
    s3Upload.handle(files);
  }, []);

  useEffect(() => {
    const el = getTargetElement(inputRef);
    el.addEventListener('change', onFileChange);
    return () => {
      el.removeEventListener('change', onFileChange);
    };
  }, [options, inputRef]);
}

export default useS3Uploader;
