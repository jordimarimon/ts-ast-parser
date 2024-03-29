export function enumerable(value: boolean) {
    return function (_target: Greeter, _propertyKey: string, descriptor: PropertyDescriptor): void {
        descriptor.enumerable = value;
    };
}

export class Greeter {
    greeting: string;

    constructor(message: string) {
        this.greeting = message;
    }

    @enumerable(false)
    greet(): string {
        return `Hello, ${this.greeting}`;
    }
}
