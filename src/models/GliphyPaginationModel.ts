/**
 * Class to contain the Gliphy API pagination result properties.
 */
export class GliphyPaginationModel {
  /**
   * Constructor.
   * @param one per field
   */
  constructor(
    public readonly totalCount: number,
    public readonly count: number,
    public readonly offset: number,
  ) {
  }
}
