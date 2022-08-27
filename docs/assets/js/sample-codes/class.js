export const CLASS_CODE = `
/**
 * This is the description of the class.
 */
export default class Point {

    /** The x coordinate  */
    x: number;

    /** The y coordinate */
    y: number;

    /**
     * @param {number} x - The initial x coordinate
     * @param {number} y - The initial y coordinate
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Scales the coordinates by a given factor.
     *
     * @param {number} n - The scale factor
     */
    scale(n: number): void {
        this.x *= n;
        this.y *= n;
    }
}
`;
