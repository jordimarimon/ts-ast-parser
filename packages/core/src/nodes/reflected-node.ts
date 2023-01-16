import ts from 'typescript';


export interface ReflectedNode<POJO, T extends ts.Node = ts.Node> {

    /**
     * Returns the original TS node
     */
    getTSNode(): T;

    /**
     * Returns a simple readonly JavaScript object without methods or internal state.
     */
    toPOJO(): POJO;

}
