import { ClassMethod, ModifierType } from '../models/index.js';
import { createFunctionLike } from './create-function.js';
import { isStaticMember } from '../utils/index.js';
import ts from 'typescript';


export function createMethod(node: ts.MethodDeclaration | ts.PropertyDeclaration): ClassMethod {
    return {
        ...createFunctionLike(node),
        kind: 'method',
        static: isStaticMember(node),
        modifier: ModifierType.public,
    };
}
