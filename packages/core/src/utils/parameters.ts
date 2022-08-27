import { ConstructWithParameters, ConstructWithTypeParameter } from './types.js';
import { JSDocTagName, Parameter } from '../models/index.js';
import { resolveExpression } from './resolve-expression.js';
import { findJSDoc, getAllJSDoc } from './js-doc.js';
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
        const jsDoc = getAllJSDoc(param);
        const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
        const userDefinedType = param.type?.getText();
        const computedType = checker?.typeToString(checker?.getTypeAtLocation(param), param) || '';
        const parameter: Parameter = {
            name: param.name.getText(),
            decorators: [],
            jsDoc,
            optional: checker?.isOptionalParameter(param) ?? !!param?.questionToken,
            default: resolveExpression(param?.initializer),
            rest: !!(param?.dotDotDotToken && param.type?.kind === ts.SyntaxKind.ArrayType),
            type: jsDocDefinedType
                ? {text: jsDocDefinedType}
                : {text: userDefinedType ?? computedType},
        };

        parameters.push(parameter);
    }

    return parameters;
}
