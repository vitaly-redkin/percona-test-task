/**
 * Class to contain the Gliphy API image properties.
 */
export class GliphyImageModel {
  /**
   * Constructor.
   * @param one per field
   */
  constructor(
    public readonly width: number,
    public readonly height: number,
  ) {
  }
}
