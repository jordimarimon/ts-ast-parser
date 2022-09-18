import 'reflect-metadata';


export const formatMetadataKey = Symbol('format');

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function format(formatString: string) {
    return Reflect.metadata(formatMetadataKey, formatString);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getFormat(target: Greeter, propertyKey: string) {
    return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}

export class Greeter {

    @format('Hello, %s')
    readonly greeting: string;

    constructor(message: string) {
        this.greeting = message;
    }

    greet(): string {
        const formatString = getFormat(this, 'greeting');
        return formatString.replace('%s', this.greeting);
    }
}
