import { Export, ExportKind } from '../models/export.js';
import { ReflectedNode } from './reflected-node.js';
import ts from 'typescript';


export interface ExportNode extends ReflectedNode<Export, ts.ExportDeclaration | ts.Node> {
    getName(): string;
    getKind(): ExportKind;
    getOriginalName(): string;
    getModule(): string;
    isTypeOnly(): boolean;
    isReexport(): boolean;
}
