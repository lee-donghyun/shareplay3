export class Util {
  private readonly xWeightRegion1: number;
  private readonly xWeightRegion2: number;
  private readonly scaleWeightRegion1: number;
  private readonly scaleWeightRegion2: number;
  private readonly rubber: number;
  private readonly scrollSpeed: number;
  readonly perspective: number;

  constructor(size: number) {
    this.xWeightRegion1 = size * 0.55;
    this.xWeightRegion2 = size * 0.2;
    this.scaleWeightRegion1 = -0.2;
    this.scaleWeightRegion2 = -0.05;
    this.rubber = 0.15;
    this.scrollSpeed = 5 / size;
    this.perspective = size * 1.7;
  }

  /**
   * get the x position of the cover based on its score
   * ```
   *     │                   x
   *     │                   │
   *   0 ┼─────────x─────────┼
   *     |         │         │
   *     x         │         │
   *    -1         0         1
   * ```
   * @param score - the score of the cover, which is the index of the cover in the array
   * @returns
   */
  private getX(score: number) {
    if (score < -1) {
      return -this.xWeightRegion1 + this.xWeightRegion2 * (score + 1);
    }
    if (score < 1) {
      return score * this.xWeightRegion1;
    }
    return this.xWeightRegion1 + this.xWeightRegion2 * (score - 1);
  }

  /**
   * get the rotateY of the cover based on its score
   * ```
   *   0 ┼─────────x
   *     │         │
   * -40 x         │         x
   *    ─┼─────────┼─────────┼─
   *    -1         0         1
   * ```
   * @param score - the score of the cover, which is the index of the cover in the array
   * @returns
   */
  private getRotateY(score: number) {
    if (score < -1) {
      return 40;
    }
    if (score < 1) {
      return score * -40;
    }
    return -40;
  }

  /**
   * get thre scale of the cover based on its score
   * ```
   *    1 ┬─────────x
   *      │         │
   *  0.8 ┼────x    │    x
   *      │    │    │    │
   * 0.75 x    │    │    │    x
   *     ─┼────┼────┼────┼────┼─
   *     -2   -1    0    1    2
   * ```
   * @param score - the score of the cover, which is the index of the cover in the array
   * @returns
   */
  private getScale(score: number) {
    if (score < -2) {
      return 1 + this.scaleWeightRegion1 + this.scaleWeightRegion2;
    }
    if (score < -1) {
      return (
        1 + this.scaleWeightRegion1 - this.scaleWeightRegion2 * (score + 1)
      );
    }
    if (score < 0) {
      return 1 - this.scaleWeightRegion1 * score;
    }
    if (score < 1) {
      return 1 + this.scaleWeightRegion1 * score;
    }
    if (score < 2) {
      return (
        1 + this.scaleWeightRegion1 + this.scaleWeightRegion2 * (score - 1)
      );
    }
    return 1 + this.scaleWeightRegion1 + this.scaleWeightRegion2;
  }

  getTransform(score: number) {
    return {
      scale: this.getScale(score),
      x: this.getX(score),
      rotateY: `${this.getRotateY(score)}deg`,
      opacity: 1,
    };
  }
  getDiffScore(movementX: number, current: number, size: number) {
    const draftDiffScore = movementX * this.scrollSpeed;

    const getDraftScore = (index: number) => index - current + draftDiffScore;

    const lastElementDraftScore = getDraftScore(size - 1);
    if (lastElementDraftScore > size - 1) {
      const extra = lastElementDraftScore - (size - 1);
      return draftDiffScore - extra + extra * this.rubber;
    }

    const fisrtElementDraftScore = getDraftScore(0);
    if (fisrtElementDraftScore < -(size - 1)) {
      const extra = fisrtElementDraftScore - -(size - 1);
      return draftDiffScore - extra + extra * this.rubber;
    }

    return draftDiffScore;
  }
}
