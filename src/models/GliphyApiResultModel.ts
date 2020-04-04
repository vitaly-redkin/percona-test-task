import { GliphyDataItemModel } from './GliphyDataItemModel';
import { GliphyPaginationModel } from './GliphyPaginationModel';
import { GliphyMetaModel } from './GliphyMetaModel';

/**
 * Class to contain the Gliphy API result properties.
 */
export class GliphyApiResultModel {
  /**
   * Constructor.
   * @param one per field
   */
  constructor(
    public readonly data: GliphyDataItemModel[],
    public readonly pagination: GliphyPaginationModel,
    public readonly meta: GliphyMetaModel,
  ) {
  }
}
