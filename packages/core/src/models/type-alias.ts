import type { DeclarationKind } from './declaration-kind.js';
import type { CommentPart } from '@ts-ast-parser/comment';
import type { TypeParameter } from './type-parameter.js';
import type { Type } from './type.js';


/**
 * A type-alias declaration after being serialized
 */
export interface TypeAliasDeclaration {
    /**
     * The name of the type-alias
     */
    name: string;

    /**
     * The type of declaration
     */
    kind: DeclarationKind.TypeAlias;

    /**
     * The start line number where the type-alias is defined
     */
    line: number;

    /**
     * The type that it's assigned
     */
    value: Type;

    /**
     * The type parameters defined in the type-alias
     */
    typeParameters?: TypeParameter[];

    /**
     * Any JSDoc comment
     */
    jsDoc?: CommentPart[];

    /**
     * The namespace name where the type-alias is defined
     */
    namespace?: string;
}
