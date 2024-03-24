import type { ProjectContext } from '../project-context.js';
import type { ReflectedNode } from '../reflected-node.js';
import { assert } from '../analyser-diagnostic.js';
import ts from 'typescript';

import { ClassNode } from '../nodes/class-node.js';
import { FunctionNode } from '../nodes/function-node.js';
import type { SymbolWithContext } from '../nodes/class-or-interface-node.js';


type ReflectorNodeFactory =
    (node: ts.Node, context: ProjectContext, member?: SymbolWithContext) => ReflectedNode;

const nodes: { [key in ts.SyntaxKind]?: ReflectorNodeFactory } = {
    [ts.SyntaxKind.ClassDeclaration]: (node: ts.Node, context: ProjectContext): ReflectedNode => {
        return new ClassNode(node as ts.ClassDeclaration, context);
    },
    [ts.SyntaxKind.ClassExpression]: (node: ts.Node, context: ProjectContext): ReflectedNode => {
        return new ClassNode(node as ts.ClassExpression, context);
    },
    [ts.SyntaxKind.FunctionDeclaration]: (node: ts.Node, context: ProjectContext, member?: SymbolWithContext): ReflectedNode => {
        return new FunctionNode(node as ts.FunctionDeclaration, context, member);
    },
};

export function createNode(node: ts.Node, context: ProjectContext): ReflectedNode {
    const factory = nodes[node.kind];
    assert(factory != null, '');
    return factory(node, context);
}

export function createMember(
    node: ts.Node,
    context: ProjectContext,
    member: SymbolWithContext,
): ReflectedNode {
    const factory = nodes[node.kind];
    assert(factory != null, '');
    return factory(node, context, member);
}
