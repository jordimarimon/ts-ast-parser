import { createFunctionLike } from './create-function';
import { ClassMethod, ModifierType } from '../models';
import { isStaticMember } from '../utils';
import { Options } from '../options';
import ts from 'typescript';


export function createMethod(
    node: ts.MethodDeclaration | ts.PropertyDeclaration,
    options: Partial<Options> = {},
): ClassMethod {
    return {
        ...createFunctionLike(node, options),
        kind: 'method',
        static: isStaticMember(node),
        modifier: ModifierType.public,
    };
}
