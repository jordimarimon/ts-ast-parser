import type { DeclarationKind } from '../models/declaration-kind.js';
import type { ReflectedRootNode } from '../reflected-node.js';
import type { Declaration } from '../models/declaration.js';
import type { MemberKind } from '../models/member-kind.js';
import type { CommentNode } from './comment-node.js';
import type ts from 'typescript';


/**
 * A reflected node that represents a declaration.
 */
export interface DeclarationNode<Model extends object = Declaration, TSNode extends ts.Node | ts.Signature = ts.Node> extends ReflectedRootNode<Model, TSNode> {
    /**
     * Returns the name of the declaration.
     */
    getName(): string;

    /**
     * Returns the documentation comment attached to this declaration.
     */
    getJSDoc(): CommentNode | null;

    /**
     * Returns the type of declaration
     */
    getKind(): DeclarationKind | MemberKind;

    /**
     * Returns the namespaces where this declaration is inside.
     *
     * If no namespace is found, an empty string is returned.
     */
    getNamespace(): string;
}
