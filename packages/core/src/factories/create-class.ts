import { ClassDeclaration } from '../models/class.js';
import { ClassNode } from '../nodes/class-node.js';
import { AnalyzerContext } from '../context.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';


export const classFactory: NodeFactory<ClassDeclaration, ClassNode, ts.ClassDeclaration | ts.ClassExpression> = {

    isNode: (node: ts.Node): node is ts.ClassDeclaration | ts.ClassExpression => {
        return ts.isClassDeclaration(node) || ts.isClassExpression(node);
    },

    create: (node: ts.ClassDeclaration | ts.ClassExpression, context: AnalyzerContext): ClassNode[] => {
        return [new ClassNode(node, context)];
    },

};
