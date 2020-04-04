/** 
 * Base class API calls services
 */

/**
 * Class with API error information.
 */
export class ServiceError {
    /**
     * Constructor.
     * 
     * @param message error message
     * @param expected true if error is expected one or false otherwise
     * @param sessionExpired" true if session is expired
     */
    public constructor(
        public readonly message: string,
        public readonly expected: boolean = false,
        public readonly sessionExpired: boolean = false,
    ) {
    }

    /**
     * Message to show to the user.
     */
    public get userMessage(): string {
        return (this.expected ? this.message : 'Server error occurred. Please try again later.');
    }
}

/**
 * Type for the API call success handlers.
 */
export type SuccessHandler<TResult> = (result: TResult) => void;

/**
 * Type for the API call error handlers.
 */
export type ErrorHandler = (error: ServiceError) => void;

export class BaseService {
    /**
     * Calls a specified API endpoint.
     * 
     * @param endpoint API endpoint to call
     * @param method HTTP method to use (GET, POST, PUT, DELETE)
     * @param data payload object
     * @param authTokens - either both access and refresh tokens, or only one token, or null
     * @param onSuccess function to call on success
     * @param onError function to call on error
     * @param isThirdPartyApi true if this is a third party API
     * @param customHeaders custom headers to use in the API call
     */
    public callApi<TPayload, TResult>(
        endpoint: string,
        method: string,
        data: TPayload | null,
        onSuccess: SuccessHandler<TResult>,
        onError:  ErrorHandler,
        isThirdPartyApi: boolean = false,
        customHeaders: Record<string, string> | undefined = undefined,
    ): void {
        const dataToUse: TPayload | null = (data === null ? null : this.jsToPythonObj(data));
        const url: string = (isThirdPartyApi ? endpoint : `${this.getApiHost()}${endpoint}`);
        const headers: Record<string, string> = this.getApiCallHttpHeaders(
            isThirdPartyApi, customHeaders);
        try {
            fetch(
                url,
                {
                    method: method,
                    body: (dataToUse === null ? null : JSON.stringify(dataToUse)),
                    headers: headers,
                    ...(isThirdPartyApi ? {} : {mode: 'cors'}),
                }
            )
            .then(async response =>  { 
                // fetch() resolves promise successfully even if responce.ok is false
                // API retuns JSON with error description when HTTP status is 400
                // Otherwise treat the call as failed with nothing but HTTP status known
                if (response.ok || response.status === 400) {
                    return await response.json();
                  } else {
                    return {_error: `Request rejected with status ${response.status}`, _code: response.status};
                  }
                }
            )
            .catch((error: Error) => { onError(new ServiceError(error.message)); })
            .then((response: TResult | ApiSuccess<TResult> | ApiError) => { 
                if (response) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (!isThirdPartyApi && '_error' in (response as any)) {
                        const apiError: ApiError = response as ApiError;
                        const expected: boolean = 
                            (apiError._code === undefined || apiError._code === 200 || apiError._code === 400);
                        onError(new ServiceError(apiError._error, expected));
                    } else {
                        if (onSuccess) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const result: Record<string, any> = 
                                (isThirdPartyApi ?
                                 response as TResult : 
                                 (response as ApiSuccess<TResult>).result);
                            const jsResult = this.pythonToJsObj(result)
                            onSuccess(jsResult);
                        }
                    }
                }
            })
            .catch((error: Error) => { 
                if (onError) {
                    onError(new ServiceError(error.message)); 
                }
            });
        } catch (error) {
            if (onError) {
                onError(new ServiceError(error.message)); 
            }
        }
    }

    /**
     * Composes request headers for the API call.
     * 
     * @param isThirdPartyApi true if this is the call to the thord-party API
     * @param customHeaders custom headers to use in the API call
     */
    public getApiCallHttpHeaders(
        isThirdPartyApi: boolean = false,
        customHeaders: Record<string, string> | undefined = undefined,
    ): Record<string, string> {
        return {
            'Content-Type': 'application/json', 
            ...(!isThirdPartyApi ? {'Access-Control-Allow-Origin': '*'} : {}),
            ...(customHeaders ? customHeaders : {}),
        };
    }

    /**
     * Returns API host to add to the endpoint names.
     */
    public getApiHost(): string {
        return process.env.REACT_APP_API_HOST!;
    }

    /**
     * Adds API host to the URL if necessary.
     * 
     * @param url URL to check and add the API host
     */
    public addApiHost(url: string): string {
        return (
            url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://')
            ? url : `${this.getApiHost()}${url}`
        );
    }

    /**
     * Converts object property names from Python style (python_case) to Javascript style (camelCase).
     * 
     * @param obj object to convert property names of
     * @returns object with converted property names
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private pythonToJsObj(obj: any): any {
        return this.convertObjPropertyNames(obj, this.pythonToJsName);
    }

    /**
     * Converts object property names from Javascript style (camelCase) to Python style (python_case).
     * 
     * @param obj object to convert property names of
     * @returns object with converted property names
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private jsToPythonObj(obj: any): any {
        return this.convertObjPropertyNames(obj, this.jsToPythonName);
    }

    /**
     * Converts object property names from one style to another
     * 
     * @param obj object to convert property names of
     * @param propertyNameConvertor function to convert proprty name
     * @returns object with converted property names
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private convertObjPropertyNames(obj: any, propertyNameConvertor: (name: string) => string): any {
        if (!obj) {
            return obj;
        } else if (Array.isArray(obj)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any[] = 
                obj.map((item) => this.convertObjPropertyNames(item, propertyNameConvertor));

            return result;
        } else if (typeof(obj) === 'object') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: Record<string, any> = {};
            const propNames: string[] = Object.getOwnPropertyNames(obj);
            propNames.forEach((propName: string) => {
                const newPropName = propertyNameConvertor(propName);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const value: any = obj[propName];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const newValue: any = this.convertObjPropertyNames(value, propertyNameConvertor);
                result[newPropName] = newValue;
            });

            return result;
        } else {
            return obj;
        }
    }

    /**
     * Converts name from Python style (python_case) to Javascript style (camelCase).
     * 
     * @param name name to convert
     * @returns Javascript-styles name (camelCased)
     */
    private pythonToJsName(name: string): string {
        let result: string = name;
        for (let i = name.length - 2; i >= 0; i--) {
            const c: string = name[i];
            if (c === '_') {
                result = result.slice(0, i) + result[i + 1].toUpperCase() + result.slice(i + 2);
            }
        }

        return result;
    }

    /**
     * Converts name from Javascript style (camelCase) to Python style (python_case).
     * 
     * @param name name to convert
     * @returns Python style name (python_case)
     */
    private jsToPythonName(name: string): string {
        let result: string = name;
        for (let i = name.length - 1; i >= 0; i--) {
            const c: string = name[i];
            if (c === c.toUpperCase() && c !== c.toLowerCase()) {
                result = `${result.slice(0, i)}_${result.slice(i)}`;
            }
        }

        return result.toLowerCase();
    }
}  

/**
 * Interface for the empty payload.
 */
export interface IEmptyPayload {
}

/**
 * Interface for the empty result.
 */
export interface IEmptyResult {
}

/**
 * Type with API success information.
 */
export type ApiSuccess<TResult> = {
    success: boolean;
    result: TResult;
};

/**
 * Type with API error information.
 */
export type ApiError = {
    _error: string;
    _code: number;
};
