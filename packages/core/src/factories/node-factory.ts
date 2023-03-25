import { ReflectedNode } from '../nodes/reflected-node.js';
import ts from 'typescript';


export interface NodeFactory<Model extends object, AstNode extends ReflectedNode<Model, T>, T extends ts.Node> {

    isNode(node: ts.Node): node is T;

    create(node: T): AstNode[];

}
