import { Declaration } from '../models/declaration.js';
import { ReflectedNode } from './reflected-node.js';


export interface DeclarationNode extends ReflectedNode<Declaration> {
    getName(): string;
}
