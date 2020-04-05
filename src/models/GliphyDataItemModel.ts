import { GliphyImageModel } from './GliphyImageModel';

/**
 * Class to contain the Gliphy API data item properties.
 */
export class GliphyDataItemModel {
  /**
   * Constructor.
   * @param one per field
   */
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: string,
    public readonly images: { original: GliphyImageModel },
  ) {
  }
}
