/**
 * Class to contain the Gliphy API meta result properties.
 */
export class GliphyMetaModel {
  /**
   * Constructor.
   * @param one per field
   */
  constructor(
    public readonly status: number,
    public readonly msg: string,
  ) {
  }
}
