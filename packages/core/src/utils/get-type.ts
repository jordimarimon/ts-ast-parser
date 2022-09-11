import { Context } from '../context.js';
import ts from 'typescript';


export function getTypeName(node: ts.Node): string {
    const checker = Context.checker;
    const type = getType(node);

    return type ? (checker?.typeToString(type) ?? '') : '';
}

export function getType(node: ts.Node): ts.Type | undefined {
    const checker = Context.checker;
    const type = checker?.getTypeAtLocation(node);

    if (ts.hasOnlyExpressionInitializer(node) && node.initializer && ts.isAsExpression(node.initializer)) {
        return type;
    }

    // Don't use the inferred literal types like "const x = 4" gives "x: 4" instead of "x: number"
    return type && checker?.getBaseTypeOfLiteralType(type);
}
