import { FunctionReturn, FunctionSignature } from '../models/function.js';
import { getLinePosition, getLocation } from '../utils/get-location.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { TypeParameterNode } from './type-parameter-node.js';
import { getTypeFromTSType } from '../utils/get-type.js';
import { ReflectedNode } from './reflected-node.js';
import { ParameterNode } from './parameter-node.js';
import { AnalyzerContext } from '../context.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import ts from 'typescript';


export class SignatureNode implements ReflectedNode<FunctionSignature, ts.Signature> {

    private readonly _node: ts.Signature;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.Signature, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): AnalyzerContext {
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
        return getLocation(this._node.getDeclaration(), this._context).path;
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node.getDeclaration());
    }

    getReturnType(): FunctionReturn {
        const returnTypeOfSignature = this._context.checker.getReturnTypeOfSignature(this._node);

        return {
            type: getTypeFromTSType(returnTypeOfSignature, this._context),
        };
    }

    getTypeParameters(): TypeParameterNode[] {
        return this._node.getDeclaration().typeParameters?.map(tp => new TypeParameterNode(tp, this._context)) ?? [];
    }

    getParameters(): ParameterNode[] {
        const symbolParameters = this._node.parameters ?? [];
        const declarationParameters = this._node.getDeclaration().parameters ?? [];
        const result: ParameterNode[] = [];

        for (let index = 0; index < declarationParameters.length; index++) {
            const node = new ParameterNode(declarationParameters[index], symbolParameters[index], this._context);

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

    toPOJO(): FunctionSignature {
        const tmpl: FunctionSignature = {
            line: this.getLine(),
            return: this.getReturnType(),
        };

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().toPOJO());
        tryAddProperty(tmpl, 'typeParameters', this.getTypeParameters().map(tp => tp.toPOJO()));
        tryAddProperty(tmpl, 'parameters', this.getParameters().map(param => param.toPOJO()));

        return tmpl;
    }

}
