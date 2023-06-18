import { tryAddProperty } from '../utils/try-add-property.js';
import type { IndexSignature } from '../models/interface.js';
import { getLinePosition } from '../utils/get-location.js';
import type { ReflectedNode } from './reflected-node.js';
import type { SymbolWithContext } from '../utils/is.js';
import { MemberKind } from '../models/member-kind.js';
import type { AnalyzerContext } from '../context.js';
import { ParameterNode } from './parameter-node.js';
import { JSDocTagName } from '../models/js-doc.js';
import type { Type } from '../models/type.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import type ts from 'typescript';


export class IndexSignatureNode implements ReflectedNode<IndexSignature, ts.IndexSignatureDeclaration> {

    private readonly _node: ts.IndexSignatureDeclaration;

    private readonly _member: SymbolWithContext;

    private readonly _context: AnalyzerContext;

    private readonly _parameter: ParameterNode | null;

    private readonly _jsDoc: JSDocNode;

    constructor(node: ts.IndexSignatureDeclaration, member: SymbolWithContext, context: AnalyzerContext) {
        this._node = node;
        this._member = member;
        this._context = context;
        this._parameter = this._getParameter();
        this._jsDoc = new JSDocNode(this._node);
    }

    getName(): string {
        return this._parameter?.getName() ?? '';
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
        return this._jsDoc;
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

    getIndexType(): Type | null {
        return this._parameter?.getType() ?? null;
    }

    isOptional(): boolean {
        return !!this._parameter?.isOptional();
    }

    serialize(): IndexSignature {
        const tmpl: IndexSignature = {
            name: this.getName(),
            line: this.getLine(),
            kind: MemberKind.IndexSignature,
            type: this.getType(),
        };

        tryAddProperty(tmpl, 'indexType', this.getIndexType());
        tryAddProperty(tmpl, 'optional', this.isOptional());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());

        return tmpl;
    }

    private _getParameter(): ParameterNode | null {
        const callSignature = this._member.type?.getCallSignatures()?.[0];
        const nodeParameters = this._node.parameters ?? [];
        const symbolParameters = callSignature?.parameters ?? [];
        const nodeParam = nodeParameters[0];
        const symbolParam = symbolParameters[0] ?? null;

        if (!nodeParam) {
            return null;
        }

        return new ParameterNode(nodeParam, symbolParam, this._context);
    }

}
