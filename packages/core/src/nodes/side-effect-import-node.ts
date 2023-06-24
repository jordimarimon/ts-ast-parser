import { tryAddProperty } from '../utils/try-add-property.js';
import { isBareModuleSpecifier } from '../utils/import.js';
import type { ReflectedNode } from './reflected-node.js';
import type { AnalyzerContext } from '../context.js';
import type { Import } from '../models/import.js';
import { ImportKind } from '../models/import.js';
import { NodeType } from '../models/node.js';
import type ts from 'typescript';


export class SideEffectImportNode implements ReflectedNode<Import, ts.ImportDeclaration> {

    private readonly _node: ts.ImportDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.ImportDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getTSNode(): ts.ImportDeclaration {
        return this._node;
    }

    getNodeType(): NodeType {
        return NodeType.Import;
    }

    getKind(): ImportKind.SideEffect {
        return ImportKind.SideEffect;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getImportPath(): string {
        return (this._node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
    }

    isBareModuleSpecifier(): boolean {
        return isBareModuleSpecifier(this.getImportPath());
    }

    serialize(): Import {
        const tmpl: Import = {
            kind: ImportKind.SideEffect,
            importPath: this.getImportPath(),
        };

        tryAddProperty(tmpl, 'bareModuleSpecifier', this.isBareModuleSpecifier());

        return tmpl;
    }
}