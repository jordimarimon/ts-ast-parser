import { NodeType } from '../models/node.js';
import ts from 'typescript';


export interface ReflectedNode<Model extends object = object, T extends ts.Node = ts.Node> {

    /**
     * The type of node. Can be an import, an export or a declaration
     */
    getNodeType(): NodeType;

    /**
     * Returns the original TS node
     */
    getTSNode(): T;

    /**
     * Returns a simple readonly JavaScript object without methods or internal state.
     */
    toPOJO(): Model;

}
