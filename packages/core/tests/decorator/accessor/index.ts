export function configurable(value: boolean) {
    return function (_target: Point, _propertyKey: string, descriptor: PropertyDescriptor): void {
        descriptor.configurable = value;
    };
}

export class Point {

    @configurable(false)
    get x(): number {
        return this._x;
    }

    @configurable(false)
    get y(): number {
        return this._y;
    }

    private readonly _x: number;

    private readonly _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }
}
