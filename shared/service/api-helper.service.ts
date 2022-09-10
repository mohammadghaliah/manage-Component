import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpHeaders,
} from '@angular/common/http';
import { LocaleService } from 'angular-l10n';
import { Observable, throwError } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import {
  Upload,
  uploadProgress,
} from 'src/app/core/services/upload-progress.service';

class ApiOptions {
  headers?: HttpHeaders;
  observe?: 'body';
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
  reportProgress?: boolean;
  withCredentials?: boolean;

  notJsonBody?: boolean;
  noExtraHeaders?: boolean;
  showSpinner?: boolean;
  skipInterceptorErrors?: boolean;
  skipAuthorization?: boolean;
  hasFileHaders?: boolean;
  isTextResponseType?: boolean;
}

@Injectable()
export class ApiHelperService {
  constructor(private http: HttpClient, public locale: LocaleService) {}

  getFileRequestHeaders(customHeader?: HttpHeaders): HttpHeaders {
    if (!customHeader) customHeader = new HttpHeaders();

    let headers = customHeader
      .set('Accept', 'application/json')
      .set('Accept-Language', this.locale.getCurrentLanguage());

    return headers;
  }

  getRequestHeaders(customHeader?: HttpHeaders): HttpHeaders {
    if (!customHeader) customHeader = new HttpHeaders();

    let headers = customHeader.set(
      'Accept-Language',
      this.locale.getCurrentLanguage()
    );

    if (customHeader.has('Accept')) {
      headers.set('Accept', customHeader.get('Accept').valueOf());
    } else {
      headers.set('Accept', 'application/json');
    }

    if (customHeader.has('Content-Type')) {
      headers.set('Content-Type', customHeader.get('Content-Type').valueOf());
    } else {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  getRequestBody(data, options?: ApiOptions) {
    let content: any;
    if (options.notJsonBody) {
      content = data;
    } else {
      content = JSON.stringify(data);
    }
    return content;
  }

  prepareReuqest(data: any, options?: ApiOptions) {
    if (!options) {
      options = {};
    }

    let responseType = 'json';
    if (options.isTextResponseType) {
      responseType = 'text';
    }
    var resultOptions: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]: string | string[];
          };
      reportProgress?: boolean;
      responseType?: any;
      withCredentials?: boolean;
    } = {};

    let content: any = this.getRequestBody(data, options);

    resultOptions.headers = options.headers;
    resultOptions.params = options.params;
    resultOptions.withCredentials = options.withCredentials;
    resultOptions.responseType = responseType;

    if (!options.noExtraHeaders) {
      if (options.hasFileHaders) {
        resultOptions.headers = this.getFileRequestHeaders(options.headers);
      } else {
        resultOptions.headers = this.getRequestHeaders(options.headers);
      }
    }

    if (!resultOptions.headers) {
      resultOptions.headers = new HttpHeaders();
    }

    if (options.skipInterceptorErrors) {
      resultOptions.headers = resultOptions.headers.set('skip-error', 'true');
    }

    if (options.showSpinner) {
      resultOptions.headers = resultOptions.headers.set('show-spinner', 'true');
    }

    if (options.skipAuthorization) {
      resultOptions.headers = resultOptions.headers.set(
        'skip-authorization',
        'true'
      );
    }

    return { content, resultOptions };
  }

  post<TData, TResponse>(
    uri: string,
    data: TData,
    options?: ApiOptions
  ): Observable<TResponse> {
    let { content, resultOptions } = this.prepareReuqest(data, options);

    return this.http.post(uri, content, resultOptions).pipe(
      map((res: TResponse) => {
        return res;
      }),
      catchError((error: any) => {
        return this.handleError(error);
      }),
      finalize(() => {
        this.handleFinally();
      })
    );
  }

  postWithoutGlobalHandler<TData, TResponse>(
    uri: string,
    data: TData,
    options?: ApiOptions
  ): Observable<any> {
    let { content, resultOptions } = this.prepareReuqest(data, options);

    return this.http.post(uri, content, resultOptions).pipe(
      map((res: TResponse) => {
        return res;
      }),
      catchError((error: any) => {
        return this.handleError(error);
      }),
      finalize(() => {
        this.handleFinally();
      })
    );
  }

  postWithMobileFile<TResponse>(
    uri: string,
    content: File[],
    attachmentTypeCode: string,
    objId: any,
    options?: ApiOptions
  ): Observable<TResponse> {
    const form = new FormData();
    for (var i in content) {
      form.append('files', content[i], attachmentTypeCode);
    }
    form.append('objectId', objId);
    form.append('attachmentTypeCode', '0180007');

    let { resultOptions } = this.prepareReuqest(content, options);

    this.http.post(uri, form, resultOptions).subscribe(
      (result) => {
        return result;
      },
      (error) => {
        return this.handleError(error);
      }
    );
    return null;
  }

  postWithFile<TResponse>(
    uri: string,
    content: any,
    objId: any,
    options?: ApiOptions
  ): Observable<TResponse> {
    const form = new FormData();
    for (var i in content) {
      form.append('files', content[i].File, content[i].AttachmentFileTypeId);
      if (objId != null && objId != '') content[i].ObjectId = objId;
      delete content[i].File;
    }
    form.append('entity', JSON.stringify(content));

    let { resultOptions } = this.prepareReuqest(content, options);

    this.http.post(uri, form, resultOptions).subscribe(
      (result) => {
        return result;
      },
      (error) => {
        return this.handleError(error);
      }
    );
    return null;
  }

  postWithAttachments<TResponse>(
    uri: string,
    content: any,
    attachments,
    attachmentAttributes: any,
    options?: ApiOptions
  ): Observable<TResponse> {
    const form = new FormData();
    for (var i in attachments) {
      form.append('files', attachments[i].file, attachments[i].fileName);
    }
    delete content.UserAttachments;
    form.append('attributes', JSON.stringify(attachmentAttributes));
    form.append('entity', JSON.stringify(content));

    let { resultOptions } = this.prepareReuqest(content, options);

    return this.http.post(uri, form, resultOptions).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((error: any) => {
        return this.handleError(error);
      }),
      finalize(() => {
        this.handleFinally();
      })
    );
  }

  putWithAttachments<TResponse>(
    uri: string,
    content: any,
    attachments,
    attachmentAttributes: any,
    deletedIds: any,
    options?: ApiOptions
  ): Observable<TResponse> {
    const form = new FormData();
    for (var i in attachments) {
      form.append('files', attachments[i].file, attachments[i].fileName);
    }
    delete content.UserAttachments;
    form.append('attributes', JSON.stringify(attachmentAttributes));
    form.append('deletedIds', JSON.stringify(deletedIds));
    form.append('entity', JSON.stringify(content));

    let { resultOptions } = this.prepareReuqest(content, options);

    return this.http
      .put(uri, form, {
        ...resultOptions,
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        uploadProgress(),
        map((res: any) => {
          return res;
        }),
        catchError((error: any) => {
          return this.handleError(error);
        }),
        finalize(() => {
          this.handleFinally();
        })
      );
  }

  get<TResponse>(
    uri: string,
    params = new HttpParams(),
    options?: ApiOptions
  ): Observable<TResponse> {
    let { resultOptions } = this.prepareReuqest(params, options);

    return this.http.get(uri, resultOptions).pipe(
      map((res: TResponse) => {
        return res;
      }),
      catchError((error: any) => {
        return this.handleError(error);
      }),
      finalize(() => {
        this.handleFinally();
      })
    );
  }

  delete<TResponse>(
    uri: string,
    params = new HttpParams(),
    options?: ApiOptions
  ): Observable<TResponse> {
    let { resultOptions } = this.prepareReuqest(params, options);

    return this.http.delete(uri, resultOptions).pipe(
      map((res: TResponse) => {
        return res;
      }),
      catchError((error: any) => {
        return this.handleError(error);
      }),
      finalize(() => {
        this.handleFinally();
      })
    );
  }

  put<TData, TResponse>(
    uri: string,
    data: TData,
    params = new HttpParams(),
    options?: ApiOptions
  ): Observable<TResponse> {
    let { content, resultOptions } = this.prepareReuqest(data, options);

    return this.http.put(uri, content, resultOptions).pipe(
      map((res: TResponse) => {
        return res;
      }),
      catchError((error: any) => {
        return this.handleError(error);
      }),
      finalize(() => {
        this.handleFinally();
      })
    );
  }

  private handleError(httpErrorResponse: HttpErrorResponse) {
    return throwError(httpErrorResponse);
  }

  download<TResponse>(uri) {
    var options: any = {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': this.locale.getCurrentLanguage(),
      },
    };
    return this.http.get(uri, options).pipe(
      catchError((error: any) => {
        return this.handleError(error);
      }),
      finalize(() => {
        this.handleFinally();
      })
    );
  }

  getBlob(uri: string) {
    var options: any = {
      responseType: 'blob',
      headers: { 'Accept-Language': this.locale.getCurrentLanguage() },
    };

    return this.http.get(uri, options).pipe(
      catchError((error: any) => {
        return this.handleError(error);
      }),
      finalize(() => {
        this.handleFinally();
      })
    );
  }

  private handleFinally() {}
}
