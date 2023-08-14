import type { DeclarationKind } from './declaration-kind.js';
import type { SourceReference } from './reference.js';
import type { Type } from './type.js';

/**
 * Represents a reference to a class or an interface
 */
export interface ExpressionWithTypeArguments {
    /**
     * The name of the symbol
     */
    name: string;

    /**
     * The type of declaration
     */
    kind?: DeclarationKind.Class | DeclarationKind.Interface;

    /**
     * The type arguments
     */
    typeArguments?: readonly Type[];

    /**
     * The location of the symbol
     */
    source?: SourceReference;
}
