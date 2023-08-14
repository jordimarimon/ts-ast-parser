import type { AnalyserContext } from '../analyser-context.js';
import type { ReflectedRootNode } from '../reflected-node.js';
import { hasDefaultKeyword } from '../utils/export.js';
import type { Export } from '../models/export.js';
import { ExportKind } from '../models/export.js';
import { RootNodeType } from '../models/node.js';
import type ts from 'typescript';


export type ExportDeclarationNodeType =
    | ts.FunctionDeclaration
    | ts.ClassDeclaration
    | ts.InterfaceDeclaration
    | ts.EnumDeclaration
    | ts.TypeAliasDeclaration
    | ts.VariableStatement;

// CASE of:
//      export const x = 4;
//      export class Foo {}
//      export default function foo() {}
//      ...
export class ExportDeclarationNode implements ReflectedRootNode<Export, ExportDeclarationNodeType> {

    private readonly _node: ExportDeclarationNodeType;

    private readonly _declaration: ts.VariableDeclaration | null = null;

    private readonly _context: AnalyserContext;

    constructor(node: ExportDeclarationNodeType, context: AnalyserContext, declaration?: ts.VariableDeclaration) {
        this._node = node;
        this._declaration = declaration ?? null;
        this._context = context;
    }

    getName(): string {
        if (this._declaration) {
            return this._declaration.name.getText() ?? '';
        }

        return (this._node as Exclude<ExportDeclarationNodeType, ts.VariableStatement>).name?.getText() ?? '';
    }

    /**
     * Returns the name of the symbol prefixed by any parent namespace is inside:
     *
     *      <NamespaceName1>.<Namespace2>.<SymbolName>
     */
    getFullyQualifiedName(): string {
        const node = this._declaration ?? this._node;
        const symbol = this._context.getSymbol(node);

        if (symbol) {
            const fullyQualifiedName = this._context.getTypeChecker().getFullyQualifiedName(symbol);
            return fullyQualifiedName.split('.').slice(1).join('.');
        }

        return this.getName();
    }

    getOriginalName(): string {
        return this.getName();
    }

    getNodeType(): RootNodeType {
        return RootNodeType.Export;
    }

    getContext(): AnalyserContext {
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
            name: this.getFullyQualifiedName(),
            kind: this.getKind(),
        };
    }
}
