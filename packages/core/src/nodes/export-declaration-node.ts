import type { ReflectedNode } from './reflected-node.js';
import { hasDefaultKeyword } from '../utils/export.js';
import type { AnalyzerContext } from '../context.js';
import type { Export } from '../models/export.js';
import { ExportKind } from '../models/export.js';
import { NodeType } from '../models/node.js';
import type ts from 'typescript';


export type ExportDeclarationNodeType = ts.FunctionDeclaration |
    ts.ClassDeclaration |
    ts.InterfaceDeclaration |
    ts.EnumDeclaration |
    ts.TypeAliasDeclaration |
    ts.VariableStatement;

// CASE of:
//      export const x = 4;
//      export class Foo {}
//      export default function foo() {}
//      ...
export class ExportDeclarationNode implements ReflectedNode<Export, ExportDeclarationNodeType> {

    private readonly _node: ExportDeclarationNodeType;

    private readonly _declaration: ts.VariableDeclaration | null = null;

    private readonly _context: AnalyzerContext;

    constructor(node: ExportDeclarationNodeType, context: AnalyzerContext, declaration?: ts.VariableDeclaration) {
        this._node = node;
        this._declaration = declaration ?? null;
        this._context = context;
    }

    getName(): string {
        if (this._declaration) {
            return this._declaration.name?.getText() ?? '';
        }

        return (this._node as Exclude<ExportDeclarationNodeType, ts.VariableStatement>).name?.getText() ?? '';
    }

    getOriginalName(): string {
        return this.getName();
    }

    getNodeType(): NodeType {
        return NodeType.Export;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getKind(): ExportKind {
        return hasDefaultKeyword(this._node) ? ExportKind.Default : ExportKind.Named;
    }

    getTSNode(): ExportDeclarationNodeType {
        return this._node;
    }

    serialize(): Export {
        return {
            name: this.getName(),
            kind: this.getKind(),
        };
    }

}
