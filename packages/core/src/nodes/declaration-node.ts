import { DeclarationKind } from '../models/declaration-kind.js';
import { Declaration } from '../models/declaration.js';
import { ReflectedNode } from './reflected-node.js';
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
     * Returns the type of declaration.
     */
    getKind(): DeclarationKind;

    /**
     * Returns the JSDoc comments attached to this declaration.
     */
    getJSDoc(): JSDocNode;

    /**
     * Returns the namespaces this declaration is inside.
     *
     * If no namespace is found, an empty string is returned.
     */
    getNamespace(): string;
}
