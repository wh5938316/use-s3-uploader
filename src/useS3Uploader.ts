import { useCallback, useEffect, useMemo } from "react";
import S3Uploader from './s3Uploader';
import { getTargetElement, Target } from './utils/dom';

type Fn = (...args: any) => any;

export type Options = {
  getSignedUrl: Fn
  preprocess: Fn
  onSignedUrl: Fn
  onProgress: Fn
  onFinish: Fn
  onError: Fn
  signingUrl: string
  signingUrlMethod: string
  signingUrlHeaders: Object | Fn
}

const useS3Uploader = (options, inputRef: Target) => {
  const s3Upload = useMemo(() => {
    return new S3Uploader(options);
  }, [options, inputRef]);

  const onFileChange = useCallback((el, event: Event) => {
    const files = el && el.files || [];
    s3Upload.handle(files);
  }, []);

  useEffect(() => {
    const el = getTargetElement(inputRef);
    console.log(el)

    el.addEventListener('change', (ev) => onFileChange(el, ev));
    return () => {
      el.removeEventListener('change', (ev) => onFileChange(el, ev));
    };
  }, [options, inputRef]);
}

export default useS3Uploader;
