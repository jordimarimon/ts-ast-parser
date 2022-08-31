import 'reflect-metadata';


const requiredMetadataKey = Symbol('required');

// eslint-disable-next-line @typescript-eslint/ban-types
export function required(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
    const existingRequiredParameters = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
    existingRequiredParameters.push(parameterIndex);
    Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}

export function validate(
    target: BugReport,
    propertyName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
): void {
    const method = descriptor.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = function (...args: any[]) {
        const requiredParameters = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);

        if (requiredParameters) {
            for (const parameterIndex of requiredParameters) {
                if (parameterIndex >= args.length || args[parameterIndex] === undefined) {
                    throw new Error('Missing required argument.');
                }
            }
        }

        return method?.apply(this, args);
    };
}

export class BugReport {

    type = 'report';

    readonly title: string;

    constructor(t: string) {
        this.title = t;
    }

    @validate
    print(@required verbose: boolean): string {
        if (verbose) {
            return `type: ${this.type}\ntitle: ${this.title}`;
        }

        return this.title;
    }
}
