import type { ExpressionWithTypeArguments } from '../models/expression-with-type-arguments.js';
import type { ReflectedTypeNode, ReflectedNode } from '../reflected-node.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import type { SourceReference } from '../models/reference.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { AnalyserContext } from '../analyser-context.js';
import { createType } from '../factories/create-type.js';
import type { SymbolWithLocation } from '../utils/is.js';
import { isThirdParty } from '../utils/import.js';
import { hasFlag } from '../utils/member.js';
import ts from 'typescript';


export class ExpressionWithTypeArgumentsNode implements ReflectedNode<ExpressionWithTypeArguments, ts.ExpressionWithTypeArguments> {

    private readonly _node: ts.ExpressionWithTypeArguments;

    private readonly _context: AnalyserContext;

    private readonly _loc: SymbolWithLocation;

    constructor(node: ts.ExpressionWithTypeArguments, context: AnalyserContext) {
        this._node = node;
        this._context = context;
        this._loc = context.getLocation(node.expression);
    }

    /**
     * The analyzer context
     */
    getContext(): AnalyserContext {
        return this._context;
    }

    /**
     * The internal TypeScript node
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
