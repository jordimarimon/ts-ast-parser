import { tryAddProperty } from '../utils/try-add-property.js';
import { getLinePosition } from '../utils/get-location.js';
import { IndexSignature } from '../models/interface.js';
import { MemberKind } from '../models/member-kind.js';
import { ParameterNode } from './parameter-node.js';
import { ReflectedNode } from './reflected-node.js';
import { SymbolWithContext } from '../utils/is.js';
import { JSDocTagName } from '../models/js-doc.js';
import { AnalyzerContext } from '../context.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import { Type } from '../models/type.js';
import ts from 'typescript';


export class IndexSignatureNode implements ReflectedNode<IndexSignature, ts.IndexSignatureDeclaration> {

    private readonly _node: ts.IndexSignatureDeclaration;

    private readonly _member: SymbolWithContext;

    private readonly _context: AnalyzerContext;

    private readonly _parameter: ParameterNode;

    constructor(node: ts.IndexSignatureDeclaration, member: SymbolWithContext, context: AnalyzerContext) {
        this._node = node;
        this._member = member;
        this._context = context;
        this._parameter = this._getParameter();
    }

    getName(): string {
        return this._parameter.getName();
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getKind(): MemberKind {
        return MemberKind.IndexSignature;
    }

    getTSNode(): ts.IndexSignatureDeclaration {
        return this._node;
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getType(): Type {
        const jsDocType = this.getJSDoc().getTag(JSDocTagName.type)?.getValue<string>();

        return {
            text: jsDocType || this._node.type?.getText() || '',
        };
    }

    getIndexType(): Type {
        return this._parameter.getType();
    }

    isOptional(): boolean {
        return this._parameter.isOptional();
    }

    toPOJO(): IndexSignature {
        const tmpl: IndexSignature = {
            name: this.getName(),
            line: this.getLine(),
            kind: MemberKind.IndexSignature,
            indexType: this.getIndexType(),
            type: this.getType(),
        };

        tryAddProperty(tmpl, 'optional', this.isOptional());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().toPOJO());

        return tmpl;
    }

    private _getParameter(): ParameterNode {
        const callSignature = this._member.type?.getCallSignatures()?.[0];
        const nodeParameters = this._node.parameters ?? [];
        const symbolParameters = callSignature?.parameters ?? [];
        const nodeParam = nodeParameters[0];
        const symbolParam = symbolParameters[0] ?? null;

        return new ParameterNode(nodeParam, symbolParam, this._context);
    }

}
