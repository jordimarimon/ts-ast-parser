import { PropertyLike } from './property.js';


export interface VariableDeclaration extends PropertyLike {
    kind: 'variable';
}
