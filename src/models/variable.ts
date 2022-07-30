import { PropertyLike } from './property';


export interface VariableDeclaration extends PropertyLike {
    kind: 'variable';
}
