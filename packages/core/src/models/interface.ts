import type { ExpressionWithTypeArguments } from './expression-with-type-arguments.js';
import type { DeclarationKind } from './declaration-kind.js';
import type { TypeParameter } from './type-parameter.js';
import type { MemberKind } from './member-kind.js';
import type { PropertyLike } from './property.js';
import type { Field, Method } from './member.js';
import type { DocComment } from './js-doc.js';
import type { Type } from './type.js';

/**
 * An index signature after being serialized
 */
export interface IndexSignature extends PropertyLike {
    /**
     * The type of member
     */
    kind: MemberKind.IndexSignature;

    /**
     * The type of the index signature key
     */
    indexType?: Type;

    /**
     * Whether it's read-only or not
     */
    readOnly?: boolean;
}

/**
 * An interface declaration after being serialized
 */
export interface InterfaceDeclaration {
    /**
     * The name of the interface
     */
    name: string;

    /**
     * The start line number where the interface has been defined
     */
    line: number;

    /**
     * The type of declaration
     */
    kind: DeclarationKind.Interface;

    /**
     * The interface properties
     */
    properties?: readonly Field[];

    /**
     * The index signature
     */
    indexSignature?: IndexSignature;

    /**
     * The interface methods
     */
    methods?: readonly Method[];

    /**
     * Any JSDoc comment
     */
    jsDoc?: DocComment;

    /**
     * The interface type parameters
     */
    typeParameters?: readonly TypeParameter[];

    /**
     * The heritage chain
     */
    heritage?: readonly ExpressionWithTypeArguments[];

    /**
     * The namespace name where the interface is defined
     */
    namespace?: string;
}
