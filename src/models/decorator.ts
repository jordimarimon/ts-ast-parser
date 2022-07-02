import { Parameter } from './parameter';


export enum DecoratorType {
    class = 'class',
    property = 'property',
    method = 'method',
    parameter = 'parameter',
}

/**
 *
 */
export interface Decorator {
    /**
     * The name of the decorator
     */
    name: string;

    /**
     * The type of decorator
     */
    type: DecoratorType;

    /**
     * The arguments supplied to the decorator
     */
    parameters: Parameter[];
}
