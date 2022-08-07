import { Parameter } from './parameter.js';


export enum DecoratorType {
    class = 'class',
    property = 'property',
    method = 'method',
    parameter = 'parameter',
    variable = 'variable',
}

export interface Decorator {
    name: string;
    type: DecoratorType;
    parameters: Parameter[];
}
