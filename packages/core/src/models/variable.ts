import { DeclarationKind } from './declaration.js';
import { PropertyLike } from './property.js';


export interface VariableDeclaration extends PropertyLike {
    kind: DeclarationKind.variable;
}
