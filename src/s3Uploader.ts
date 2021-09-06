import mime from 'mime-types';

type Fn = (...args: any) => any;

type Options = any;

function getFileMimeType(file) {
  return file.type || mime.lookup(file.name);
}

class S3Upload {
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

  constructor(options: Options) {
    const s3Upload = this;
    s3Upload.test = false;
    s3Upload.server = '';
    s3Upload.signingUrl = '/sign-s3';
    s3Upload.signingUrlMethod = 'GET';
    s3Upload.successResponses = [200, 201];

    if (options == null) {
      options = {};
    }
    for (let option in options) {
      if (options.hasOwnProperty(option)) {
        s3Upload[option] = options[option];
      }
    }
  }

  handle(files: File[]) {
    const result = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.onUploadStart(file, function (processedFile) {
        this.onProgress(0, 'Waiting', processedFile);
        result.push(this.uploadFile(processedFile));
        return result;
      }.bind(this));
    }
  };

  uploadFile(file: File) {
    const uploadToS3Callback = this.uploadToS3.bind(this, file);

    if (this.getSignedUrl) return this.getSignedUrl(file, uploadToS3Callback);
    return this.executeOnSignedUrl(file, uploadToS3Callback);
  };

  uploadToS3(file, signResult) {
    const xhr = this.createCORSRequest('PUT', signResult.signedUrl);
    if (!xhr) {
      this.onError('CORS not supported', file);
    } else {
      xhr.onload = function () {
        if (this.successResponses.indexOf(xhr.status) >= 0) {
          this.onProgress(100, 'Upload completed', file);
          return this.onFinish(signResult, file);
        } else {
          return this.onError(
            'Upload error: ' + xhr.status,
            file,
            this._getErrorRequestContext(xhr)
          );
        }
      }.bind(this);
      xhr.onerror = function () {
        return this.onError(
          'XHR error',
          file,
          this._getErrorRequestContext(xhr)
        );
      }.bind(this);
      xhr.upload.onprogress = function (e) {
        let percentLoaded;
        if (e.lengthComputable) {
          percentLoaded = Math.round((e.loaded / e.total) * 100);
          return this.onProgress(percentLoaded, percentLoaded === 100 ? 'Finalizing' : 'Uploading', file);
        }
      }.bind(this);
    }

    const fileType = getFileMimeType(file);

    const headers = {
      'content-type': fileType
    };

    if (this.contentDisposition) {
      let disposition = this.contentDisposition;
      if (disposition === 'auto') {
        if (fileType.substr(0, 6) === 'image/') {
          disposition = 'inline';
        } else {
          disposition = 'attachment';
        }
      }

      let fileName = this.scrubFilename(file.name)
      headers['content-disposition'] = disposition + '; filename="' + fileName + '"';
    }
    if (!this.uploadRequestHeaders) {
      xhr.setRequestHeader('x-amz-acl', 'public-read');
    }
    [signResult.headers, this.uploadRequestHeaders].filter(Boolean).forEach(function (hdrs) {
      Object.entries(hdrs).forEach(function (pair) {
        headers[pair[0].toLowerCase()] = pair[1];
      })
    });
    Object.entries(headers).forEach(function (pair) {
      xhr.setRequestHeader(pair[0], pair[1]);
    })
    this.httprequest = xhr;
    return xhr.send(file);
  };

  createCORSRequest(method, url, opts?: any) {
    opts = opts || {};
    let xhr = new XMLHttpRequest();

    if (xhr.withCredentials != null) {
      xhr.open(method, url, true);
      if (opts.withCredentials != null) {
        xhr.withCredentials = opts.withCredentials;
      }
    }
    // else if (typeof XDomainRequest !== "undefined") {
    //   xhr = new XDomainRequest();
    //   xhr.open(method, url);
    // }
    else {
      xhr = null;
    }
    return xhr;
  };

  executeOnSignedUrl(file, callback) {
    const fileName = this.scrubFilename(file.name);
    let queryString = '?objectName=' + fileName + '&contentType=' + encodeURIComponent(getFileMimeType(file));
    if (this.s3path) {
      queryString += '&path=' + encodeURIComponent(this.s3path);
    }
    if (this.signingUrlQueryParams) {
      const signingUrlQueryParams = typeof this.signingUrlQueryParams === 'function' ? this.signingUrlQueryParams() : this.signingUrlQueryParams;
      Object.keys(signingUrlQueryParams).forEach(function (key) {
        const val = signingUrlQueryParams[key];
        queryString += '&' + key + '=' + val;
      });
    }
    const xhr = this.createCORSRequest(this.signingUrlMethod,
      this.server + this.signingUrl + queryString, { withCredentials: this.signingUrlWithCredentials });
    if (this.signingUrlHeaders) {
      const signingUrlHeaders = typeof this.signingUrlHeaders === 'function' ? this.signingUrlHeaders() : this.signingUrlHeaders;
      Object.keys(signingUrlHeaders).forEach(function (key) {
        const val = signingUrlHeaders[key];
        xhr.setRequestHeader(key, val);
      });
    }
    xhr.overrideMimeType && xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && this.successResponses.indexOf(xhr.status) >= 0) {
        let result;
        try {
          result = JSON.parse(xhr.responseText);
          this.onSignedUrl(result);
        } catch (error) {
          this.onError(
            'Invalid response from server',
            file,
            this._getErrorRequestContext(xhr)
          );
          return false;
        }
        return callback(result);
      } else if (xhr.readyState === 4 && this.successResponses.indexOf(xhr.status) < 0) {
        return this.onError(
          'Could not contact request signing server. Status = ' + xhr.status,
          file,
          this._getErrorRequestContext(xhr)
        );
      }
    }.bind(this);
    return xhr.send();
  };

  onFinish(signResult, file) {
    return console.log('base.onFinish()', signResult.publicUrl);
  };

  onUploadStart(file, next) {
    console.log('base.onUploadStart()', file);
    return next(file);
  };

  onProgress = (percent, status, file) => {
    return console.log('base.onProgress()', percent, status);
  };

  onError(status, file) {
    return console.log('base.onError()', status);
  };

  onSignedUrl(result) { };

  scrubFilename(filename) {
    return filename.replace(/[^\w\d_\-\.]+/ig, '');
  };

  abortUpload() {
    this.httprequest && this.httprequest.abort();
  };

  _getErrorRequestContext(xhr) {
    return {
      response: xhr.responseText,
      status: xhr.status,
      statusText: xhr.statusText,
      readyState: xhr.readyState
    };
  }
}

export default S3Upload;
