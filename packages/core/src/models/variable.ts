import type { DeclarationKind } from './declaration-kind.js';
import type { PropertyLike } from './property.js';

/**
 * A variable declaration after being serialized
 */
export interface VariableDeclaration extends PropertyLike {
    /**
     * The type of declaration
     */
    kind: DeclarationKind.Variable;

    /**
     * The namespace name where the variable is defined
     */
    namespace?: string;
}
