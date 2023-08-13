import type { DeclarationKind } from './declaration-kind.js';
import type { TypeParameter } from './type-parameter.js';
import type { FunctionSignature } from './function.js';
import type { Field, Method } from './member.js';
import type { Reference } from './reference.js';
import type { Decorator } from './decorator.js';
import type { JSDoc } from './js-doc.js';

/**
 * The result of a class node after being serialized
 */
export interface ClassDeclaration {
    /**
     * The name of the class
     */
    name: string;

    /**
     * The start line number where the class is defined
     */
    line: number;

    /**
     * The declaration kind
     */
    kind: DeclarationKind.Class;

    /**
     * The instance properties of the class
     */
    properties?: readonly Field[];

    /**
     * The static properties of the class
     */
    staticProperties?: readonly Field[];

    /**
     * The instance methods of the class
     */
    methods?: readonly Method[];

    /**
     * The static methods of the class
     */
    staticMethods?: readonly Method[];

    /**
     * The JSDoc
     */
    jsDoc?: JSDoc;

    /**
     * The type parameters
     */
    typeParameters?: readonly TypeParameter[];

    /**
     * The heritage chain
     */
    heritage?: readonly Reference[];

    /**
     * The class decorators
     */
    decorators?: readonly Decorator[];

    /**
     * The class constructors
     */
    constructors?: readonly FunctionSignature[];

    /**
     * Whether the class is abstract or not
     */
    abstract?: boolean;

    /**
     * The namespace name where the class is defined (empty string if there is no namespace)
     */
    namespace?: string;

    /**
     * Whether the class is a custom element or not
     */
    customElement?: boolean;
}
