import type { ProjectContext } from '../project-context.js';
import type { ClassDeclaration } from '../models/class.js';
import { isClassDeclaration } from '../utils/class.js';
import type { NodeFactory } from './node-factory.js';
import { ClassNode } from '../nodes/class-node.js';
import type ts from 'typescript';


export const classFactory: NodeFactory<ClassDeclaration, ClassNode, ts.ClassDeclaration | ts.VariableStatement> = {

    isNode: (node: ts.Node): node is ts.ClassDeclaration | ts.VariableStatement => {
        return isClassDeclaration(node);
    },

    create: (node: ts.ClassDeclaration | ts.VariableStatement, context: ProjectContext): ClassNode[] => {
        const reflectedNode = context.registerReflectedNode(node, () => new ClassNode(node, context));
        return [reflectedNode];
    },

};
