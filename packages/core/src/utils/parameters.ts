import { NodeWithParameters, NodeWithTypeParameter } from './types.js';
import { JSDocTagName, Parameter } from '../models/index.js';
import { resolveExpression } from './resolve-expression.js';
import { tryAddProperty } from './try-add-property.js';
import { findJSDoc, getAllJSDoc } from './js-doc.js';
import { getDecorators } from './decorator.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function getTypeParameters(node: NodeWithTypeParameter): string[] {
    return node?.typeParameters?.map(t => t.name?.getText() || '').filter(x => x) ?? [];
}

export function getParameters(node: NodeWithParameters): Parameter[] {
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
            type: jsDocDefinedType
                ? {text: jsDocDefinedType}
                : {text: userDefinedType ?? computedType},
        };

        tryAddProperty(parameter, 'decorators', getDecorators(param));
        tryAddProperty(parameter, 'jsDoc', jsDoc);
        tryAddProperty(parameter, 'optional', !!checker?.isOptionalParameter(param));
        tryAddProperty(parameter, 'default', resolveExpression(param?.initializer));
        tryAddProperty(parameter, 'rest', !!(param?.dotDotDotToken && param.type?.kind === ts.SyntaxKind.ArrayType));

        parameters.push(parameter);
    }

    return parameters;
}
