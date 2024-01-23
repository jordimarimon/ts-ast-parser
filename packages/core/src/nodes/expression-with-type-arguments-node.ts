import type { ExpressionWithTypeArguments } from '../models/expression-with-type-arguments.js';
import type { ReflectedTypeNode, ReflectedNode } from '../reflected-node.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import type { SourceReference } from '../models/reference.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import { createType } from '../factories/create-type.js';
import type { SymbolWithLocation } from '../utils/types.js';
import { isThirdParty } from '../utils/import.js';
import { hasFlag } from '../utils/member.js';
import ts from 'typescript';


/**
 * Represents the reflected node of a type in the heritage
 * chain of a class or interface declaration
 */
export class ExpressionWithTypeArgumentsNode implements ReflectedNode<ExpressionWithTypeArguments, ts.ExpressionWithTypeArguments> {

    private readonly _node: ts.ExpressionWithTypeArguments;

    private readonly _context: ProjectContext;

    private readonly _loc: SymbolWithLocation;

    constructor(node: ts.ExpressionWithTypeArguments, context: ProjectContext) {
        this._node = node;
        this._context = context;
        this._loc = context.getLocation(node.expression);
    }

    /**
     * The context includes useful APIs that are shared across
     * all the reflected symbols.
     *
     * Some APIs include the parsed configuration options, the
     * system interface, the type checker
     *
     * @returns The analyser context
     */
    getContext(): ProjectContext {
        return this._context;
    }

    /**
     * The TypeScript AST node that is associated with the reflected one
     *
     * @returns The internal TypeScript node
     */
    getTSNode(): ts.ExpressionWithTypeArguments {
        return this._node;
    }

    getName(): string {
        return this._node.expression.getText();
    }

    getTypeArguments(): ReflectedTypeNode[] {
        return (this._node.typeArguments ?? []).map(t => createType(t, this._context));
    }

    getPath(): string {
        return this._loc.path;
    }

    getLine(): number | null {
        return this._loc.line;
    }

    /**
     * Serializes the reflected node
     *
     * @returns The reflected node as a serializable object
     */
    serialize(): ExpressionWithTypeArguments {
        const tmpl: ExpressionWithTypeArguments = {
            name: this.getName(),
            // Treat anything that is not a class, as an interface (for example utility types)
            kind: this._loc.symbol && hasFlag(this._loc.symbol.flags, ts.SymbolFlags.Class)
                ? DeclarationKind.Class
                : DeclarationKind.Interface,
        };

        const sourceRef: SourceReference = {};
        const path = this.getPath();
        const line = this.getLine();

        if (!isThirdParty(path) && line != null) {
            sourceRef.line = line;
            sourceRef.path = path;
        }

        tryAddProperty(tmpl, 'source', sourceRef);
        tryAddProperty(tmpl, 'typeArguments', this.getTypeArguments().map(t => t.serialize()));

        return tmpl;
    }
}
