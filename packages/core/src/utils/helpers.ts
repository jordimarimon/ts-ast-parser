import { ConstructWithParameters, ConstructWithTypeParameter } from './types.js';
import { Parameter } from '../models/index.js';
import { Context } from '../context.js';
import ts from 'typescript';


export const isNotEmptyArray = <T = unknown[]>(arr: unknown): arr is T => Array.isArray(arr) && arr.length > 0;

export function isFunctionDeclaration(node: ts.Node): node is ts.FunctionDeclaration | ts.VariableStatement {
    // Case of:
    //
    //      function name(...) { ... }
    //
    if (ts.isFunctionDeclaration(node)) {
        return true;
    }

    // If it's not a function declaration, we only care about case like:
    //
    //      const name = (...) => { ... };
    //

    if (!ts.isVariableStatement(node)) {
        return false;
    }

    const declaration = node.declarationList?.declarations?.[0];

    if (!declaration) {
        return false;
    }

    const initializer = declaration.initializer;

    return !!initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
}

export function getDefaultValue(node: ts.VariableDeclaration | ts.PropertyDeclaration): string {
    const expr = node.initializer;

    let defaultValue: string | undefined;

    if (expr != undefined && ts.isAsExpression(expr)) {
        defaultValue = expr?.expression?.getText();
    } else {
        defaultValue = expr?.getText();
    }

    return defaultValue ?? '';
}

export function getTypeParameters(node: ConstructWithTypeParameter): string[] {
    return node?.typeParameters?.map(t => t.name?.getText() || '').filter(x => x) ?? [];
}

export function getParameters(node: ConstructWithParameters): Parameter[] {
    const parameters: Parameter[] = [];
    const originalParameters = node?.parameters ?? [];
    const checker = Context.checker;

    for (const param of originalParameters) {
        const computedType = checker?.typeToString(checker?.getTypeAtLocation(param), param) || '';
        const parameter: Parameter = {
            name: param.name.getText(),
            decorators: [],
            optional: !!param?.questionToken,
            default: param?.initializer?.getText() ?? '',
            type: {text: param?.type?.getText() ?? computedType},
            rest: !!(param?.dotDotDotToken && param.type?.kind === ts.SyntaxKind.ArrayType),
        };

        parameters.push(parameter);
    }

    return parameters;
}
