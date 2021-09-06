import axios from 'axios';
import React, { useRef } from 'react';
import { useS3Uploader } from '../src';

const Index = (props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const getSignedUrl = (file, next) => {
    const params = {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    };

    // /signing/server
    new Promise(function (resolve, reject) {
      getImageWidthHeight(file, resolve);
    })
      .then(function (result) {
        let data = Object.assign(params, result);
        axios({
          url: "http://192.168.3.76/api/v2/signing/server",
          method: "post",
          data: data,
        })
          .then((response) => {
            const { statusText, status, data } = response;
            console.log(data.data)
            next && next(data.data);
          })
          .catch((error) => {
            console.log('Failed: ' + error)
            // onError && onError(error);
          });
      })
      .catch(function (reason) {
        console.log('Failed: ' + reason)
      });
  };

  const getImageWidthHeight = (file, resolve) => {
    let data = {
      width: 0,
      height: 0,
    };
    //读取图片数据
    const reader = new FileReader();
    reader.onload = function (e) {
      let result = e.target.result;
      //加载图片获取图片真实宽度和高度
      const image = new Image();
      image.onload = function () {
        data.width = image.width;
        data.height = image.height;
        resolve(data);
      };
      image.src = result;
    };
    reader.readAsDataURL(file);
  };

  const onUploadStart = (file, next) => {
    console.log('onUploadStart')
    next(file);
  }
  const onProgress = (percent, status, file) => {
    console.log('onProgress', percent, status, file)
  }
  const onError = (arg1, arg2) => {
    inputRef.current.value = '';
    console.log('onError', arg1, arg2)
  }
  const onFinish = (arg1, arg2) => {
    console.log('onFinish', arg1, arg2);
    inputRef.current.value = '';
  }

  useS3Uploader({
    test: true,
    getSignedUrl: getSignedUrl,
    onUploadStart: onUploadStart,
    onProgress: onProgress,
    onError: onError,
    onFinish: onFinish,
    accept: 'image/*',
    uploadRequestHeaders: {
      'x-amz-acl': 'public-read',
    },
    contentDisposition: 'auto',
  }, inputRef);

  return (
    <div>
      <input type='file' ref={inputRef} multiple={true} />
    </div>
  )
}

export default Index;
