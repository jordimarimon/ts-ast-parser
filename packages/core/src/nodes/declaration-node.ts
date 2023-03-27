import { DeclarationKind } from '../models/declaration-kind.js';
import { Declaration } from '../models/declaration.js';
import { ReflectedNode } from './reflected-node.js';
import { JSDocNode } from './jsdoc-node.js';
import ts from 'typescript';


export interface DeclarationNode<Model extends Declaration = Declaration, TSNode extends ts.Node = ts.Node> extends ReflectedNode<Model, TSNode> {
    getName(): string;

    getKind(): DeclarationKind;

    getJSDoc(): JSDocNode;

    getNamespace(): string;
}
