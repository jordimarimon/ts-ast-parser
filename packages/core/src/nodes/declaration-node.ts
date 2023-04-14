import { DeclarationKind } from '../models/declaration-kind.js';
import type { Declaration } from '../models/declaration.js';
import type { ReflectedNode } from './reflected-node.js';
import { MemberKind } from '../models/member-kind.js';
import { JSDocNode } from './jsdoc-node.js';
import ts from 'typescript';


/**
 * A reflected node that represents a declaration.
 */
export interface DeclarationNode<Model extends object = Declaration, TSNode extends ts.Node | ts.Signature = ts.Node> extends ReflectedNode<Model, TSNode> {
    /**
     * Returns the name of the declaration.
     */
    getName(): string;

    /**
     * Returns the JSDoc comments attached to this declaration.
     */
    getJSDoc(): JSDocNode | null;

    /**
     * Returns the type of Node.
     */
    getKind(): DeclarationKind | MemberKind;

    /**
     * Returns the namespaces this declaration is inside.
     *
     * If no namespace is found, an empty string is returned.
     */
    getNamespace(): string;
}
