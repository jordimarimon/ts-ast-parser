import { DeclarationKind } from './declaration-kind.js';
import type { PropertyLike } from './property.js';


export interface VariableDeclaration extends PropertyLike {
    kind: DeclarationKind.Variable;
    namespace?: string;
}
