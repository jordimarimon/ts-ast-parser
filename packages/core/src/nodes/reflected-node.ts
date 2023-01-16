import { NodeType } from '../models/node.js';
import ts from 'typescript';


export interface ReflectedNode<POJO extends Object = Object, T extends ts.Node = ts.Node> {

    /**
     * The type of node. Can be an import, an export or a declaration
     */
    getType(): NodeType;

    /**
     * Returns the original TS node
     */
    getTSNode(): T;

    /**
     * Returns a simple readonly JavaScript object without methods or internal state.
     */
    toPOJO(): POJO;

}
