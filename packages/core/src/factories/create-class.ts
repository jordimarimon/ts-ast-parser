import { isClassDeclaration } from '../utils/class.js';
import { ClassDeclaration } from '../models/class.js';
import { ClassNode } from '../nodes/class-node.js';
import { AnalyzerContext } from '../context.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';


export const classFactory: NodeFactory<ClassDeclaration, ClassNode, ts.ClassDeclaration | ts.VariableStatement> = {

    isNode: (node: ts.Node): node is ts.ClassDeclaration | ts.VariableStatement => {
        return isClassDeclaration(node);
    },

    create: (node: ts.ClassDeclaration | ts.VariableStatement, context: AnalyzerContext): ClassNode[] => {
        return [new ClassNode(node, context)];
    },

};
