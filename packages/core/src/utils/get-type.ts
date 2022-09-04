import { Context } from '../context.js';
import ts from 'typescript';


export function getType(node: ts.Node): string {
    const checker = Context.checker;
    const type = checker?.getTypeAtLocation(node);

    if (ts.hasOnlyExpressionInitializer(node) && node.initializer && ts.isAsExpression(node.initializer)) {
        return (type && checker?.typeToString(type)) ?? '';
    }

    // Don't use the inferred literal types like "const x = 4" gives "x: 4" instead of "x: number"
    const baseType = type && checker?.getBaseTypeOfLiteralType(type);

    return baseType ? (checker?.typeToString(baseType) ?? '') : '';
}
