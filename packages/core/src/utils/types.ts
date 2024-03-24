import type { ClassNode } from '../nodes/class-node.js';
import type { InterfaceNode } from '../nodes/interface-node.js';
import type { VariableStatementNode } from '../nodes/variable-statement-node.js';
import type { FunctionNode } from '../nodes/function-node.js';
import type { EnumNode } from '../nodes/enum-node.js';


export type ImportLike = null;

export type ExportLike = null;

export type DeclarationLike = ClassNode
    | InterfaceNode
    | VariableStatementNode
    | FunctionNode
    | EnumNode;
