import type { FunctionSignature } from '../models/function.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { TypeParameterNode } from './type-parameter-node.js';
import { getLinePosition } from '../utils/get-location.js';
import type { ReflectedNode } from './reflected-node.js';
import type { AnalyserContext } from '../context.js';
import { ParameterNode } from './parameter-node.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import { TypeNode } from './type-node.js';
import ts from 'typescript';


export class SignatureNode implements ReflectedNode<FunctionSignature, ts.Signature> {

    private readonly _node: ts.Signature;

    private readonly _context: AnalyserContext;

    private readonly _jsDoc: JSDocNode;

    constructor(node: ts.Signature, context: AnalyserContext) {
        this._node = node;
        this._context = context;
        this._jsDoc = new JSDocNode(this._node.getDeclaration());
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getTSNode(): ts.Signature {
        return this._node;
    }

    getLine(): number {
        return getLinePosition(this._node.getDeclaration());
    }

    getPath(): string {
        return this._node.getDeclaration()?.getSourceFile()?.fileName ?? '';
    }

    getJSDoc(): JSDocNode {
        return this._jsDoc;
    }

    getReturnType(): TypeNode {
        const jsDocType = ts.getJSDocReturnType(this._node.getDeclaration());

        if (jsDocType) {
            return new TypeNode(jsDocType, null, this._context);
        }

        const returnTypeOfSignature = this._context.checker.getReturnTypeOfSignature(this._node);

        return TypeNode.fromType(returnTypeOfSignature, this._context);
    }

    getTypeParameters(): TypeParameterNode[] {
        return this._node.getDeclaration().typeParameters?.map(tp => new TypeParameterNode(tp, this._context)) ?? [];
    }

    getParameters(): ParameterNode[] {
        const symbolParameters = this._node.parameters ?? [];
        const declarationParameters = this._node.getDeclaration().parameters ?? [];
        const result: ParameterNode[] = [];

        for (let index = 0; index < declarationParameters.length; index++) {
            const paramNode = declarationParameters[index] as ts.ParameterDeclaration;
            const node = new ParameterNode(paramNode, symbolParameters[index] ?? null, this._context);

            if (node.getJSDoc().isIgnored()) {
                continue;
            }

            result.push(node);
        }

        return result;
    }

    getParameterByName(name: string): ParameterNode | null {
        return this.getParameters().find(param => param.getName() === name) ?? null;
    }

    serialize(): FunctionSignature {
        const tmpl: FunctionSignature = {
            line: this.getLine(),
            return: {
                type: this.getReturnType().serialize(),
            },
        };

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'typeParameters', this.getTypeParameters().map(tp => tp.serialize()));
        tryAddProperty(tmpl, 'parameters', this.getParameters().map(param => param.serialize()));

        return tmpl;
    }

}
