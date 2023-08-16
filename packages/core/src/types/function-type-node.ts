import { TypeParameterNode } from '../nodes/type-parameter-node.js';
import type { ReflectedTypeNode } from '../reflected-node.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { AnalyserContext } from '../analyser-context.js';
import { ParameterNode } from '../nodes/parameter-node.js';
import { createType } from '../factories/create-type.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import ts from 'typescript';


/**
 * Represents the reflected function type
 * For example: `() => void`
 */
export class FunctionTypeNode implements ReflectedTypeNode<ts.FunctionTypeNode> {

    private readonly _node: ts.FunctionTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.FunctionTypeNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.FunctionTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Function;
    }

    getText(): string {
        return this._context.getTypeChecker().typeToString(this._type);
    }

    getTypeParameters(): TypeParameterNode[] {
        return this._node.typeParameters?.map(tP => new TypeParameterNode(tP, this._context)) ?? [];
    }

    getParameters(): ParameterNode[] {
        return (this._node.parameters ?? []).map(p => {
            const symbol = this._context.getSymbol(p);
            const decl = symbol?.getDeclarations()?.find(d => ts.isParameter(d)) as ts.ParameterDeclaration | undefined;
            return new ParameterNode(decl ?? p, symbol, this._context);
        });
    }

    getReturnType(): ReflectedTypeNode {
        return createType(this._node.type, this._context);
    }

    /**
     * The reflected type as a serializable object
     */
    serialize(): Type {
        const tmpl: Type = {
            text: this.getText(),
            kind: this.getKind(),
            return: this.getReturnType().serialize(),
        };

        tryAddProperty(tmpl, 'typeParameters', this.getTypeParameters().map(t => t.serialize()));
        tryAddProperty(tmpl, 'parameters', this.getParameters().map(p => p.serialize()));

        return tmpl;
    }
}
