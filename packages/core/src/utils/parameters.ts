import { ConstructWithParameters, ConstructWithTypeParameter } from './types.js';
import { Parameter } from '../models/index.js';
import { Context } from '../context.js';
import ts from 'typescript';


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
