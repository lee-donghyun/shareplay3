export class Util {
  delay = 200;
  getInvisibleTransform() {
    return {
      opacity: 0,
      scale: 1,
      rotateY: "-90deg",
    };
  }
  getVisibleTransform() {
    return {
      opacity: 1,
      scale: 1.5,
      delay: this.delay,
      rotateY: "0deg",
      config: { duration: this.delay },
    };
  }
  getFlippedCoverTransform() {
    return {
      rotateY: "90deg",
      opacity: 0.2,
      config: { duration: this.delay },
    };
  }
}
