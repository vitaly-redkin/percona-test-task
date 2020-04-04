import { BaseService, IEmptyPayload, SuccessHandler, ErrorHandler } from './BaseService';
import { GliphyApiResultModel } from '../models/GliphyApiResultModel';

/**
 * Class to make Gliphy API calls.
 */
export class GliphyService extends BaseService {
    /**
     * Fetches the portion of the content items.
     * 
     * @param query string with the search query
     * @param offset number of images to skip
     * @param onSuccess function to call on success
     * @param onError function to call on error
     */
    public fetchImages(
        query: string,
        offset: number,
        onSuccess: SuccessHandler<GliphyApiResultModel>,
        onError: ErrorHandler
    ): void {
        const url: string = 
            `${process.env.REACT_APP_API_URL_PREFIX}` + 
            `&q=${encodeURIComponent(query.trim())}` +
            `&offset=${offset}`;
        this.callApi<IEmptyPayload, GliphyApiResultModel>(
            url,
            'GET',
            null,
            onSuccess,
            onError,
            true
        );
    }
}
  