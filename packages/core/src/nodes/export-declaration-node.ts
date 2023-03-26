import { Export, ExportKind } from '../models/export.js';
import { hasDefaultKeyword } from '../utils/export.js';
import { ExportNode } from './export-node.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


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
export class ExportDeclarationNode implements ExportNode {

    private readonly _node: ExportDeclarationNodeType;

    private readonly _declaration: ts.VariableDeclaration | null = null;

    constructor(node: ExportDeclarationNodeType, declaration?: ts.VariableDeclaration) {
        this._node = node;
        this._declaration = declaration ?? null;
    }

    getName(): string {
        if (this._declaration) {
            return this._declaration.name?.getText() ?? '';
        }

        return (this._node as Exclude<ExportDeclarationNodeType, ts.VariableStatement>).name?.getText() ?? '';
    }

    getType(): NodeType {
        return NodeType.Export;
    }

    getKind(): ExportKind {
        return hasDefaultKeyword(this._node) ? ExportKind.default : ExportKind.named;
    }

    isTypeOnly(): boolean {
        return false;
    }

    getOriginalName(): string {
        return this.getName();
    }

    getTSNode(): ts.Node {
        return this._node;
    }

    isReexport(): boolean {
        return false;
    }

    getModule(): string {
        return '';
    }

    toPOJO(): Export {
        return {
            name: this.getName(),
            kind: this.getKind(),
        };
    }

}
