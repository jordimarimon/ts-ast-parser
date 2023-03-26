import { Import, ImportKind } from '../models/import.js';
import { ReflectedNode } from './reflected-node.js';
import ts from 'typescript';


export interface ImportNode extends ReflectedNode<Import, ts.ImportDeclaration> {
    getName(): string;
    getKind(): ImportKind;
    getImportPath(): string;
    getOriginalPath(): string;
    getReferenceName(): string;
    isTypeOnly(): boolean;
    isBareModuleSpecifier(): boolean;
}
