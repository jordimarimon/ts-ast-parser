import { createFunctionLike } from './create-function';
import { ClassMethod, ModifierType } from '../models';
import { isStaticMember } from '../utils';
import ts from 'typescript';


export function createMethod(node: ts.MethodDeclaration | ts.PropertyDeclaration): ClassMethod {
    return {
        ...createFunctionLike(node),
        kind: 'method',
        static: isStaticMember(node),
        modifier: ModifierType.public,
    };
}
