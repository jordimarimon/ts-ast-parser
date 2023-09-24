import type { DeclarationKind } from './declaration-kind.js';
import type { CommentPart } from '@ts-ast-parser/comment';

/**
 * Result of an enumerable after getting serialized
 */
export interface EnumDeclaration {
    /**
     * The declaration kind
     */
    kind: DeclarationKind.Enum;

    /**
     * The name of the enumerable
     */
    name: string;

    /**
     * The start line number where it's defined
     */
    line: number;

    /**
     * An array of members of the enumerable
     */
    members?: EnumMember[];

    /**
     * Any JSDoc comment
     */
    jsDoc?: CommentPart[];

    /**
     * The namespace where it's defined
     */
    namespace?: string;
}

/**
 * Result of an enumerable member after getting serialized
 */
export interface EnumMember {
    /**
     * The name of the enumerable member
     */
    name: string;

    /**
     * The value of the enumerable member
     */
    value: string | number;

    /**
     * Any JSDoc comment
     */
    jsDoc?: CommentPart[];
}
