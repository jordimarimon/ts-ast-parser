import type { ReflectedTypeNode } from './reflected-node.js';
import { createType } from '../factories/create-type.js';
import type { AnalyserContext } from '../context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


export class IntersectionTypeNode implements ReflectedTypeNode<ts.IntersectionTypeNode> {

    private readonly _node: ts.IntersectionTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.IntersectionTypeNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.IntersectionTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Intersection;
    }

    getText(): string {
        try {
            return this._node.getText() ?? '';
        } catch (_) {
            return this._context.checker.typeToString(this._type) ?? '';
        }
    }

    getElements(): ReflectedTypeNode[] {
        return this._node.types.map(typeNode => createType(typeNode, this._context));
    }

    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
            elements: this.getElements().map(e => e.serialize()),
        };
    }

}
