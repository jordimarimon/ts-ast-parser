import { JSDocTagName, Parameter } from '../models/index.js';
import { resolveExpression } from './resolve-expression.js';
import { tryAddProperty } from './try-add-property.js';
import { findJSDoc, getAllJSDoc } from './js-doc.js';
import { NodeWithParameters } from './types.js';
import { getDecorators } from './decorator.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function getParameters(node: NodeWithParameters, functionLikeType?: ts.Type): Parameter[] {
    // In class methods, we use the type from the call
    // signature to resolve types based on implementation in cases where
    // the methods uses typed parameters

    const parameters: Parameter[] = [];
    const originalParameters = node?.parameters ?? [];
    const callSignature = functionLikeType?.getCallSignatures()?.[0];
    const checker = Context.checker;

    for (let i = 0; i < originalParameters.length; i++) {
        const param = originalParameters[i];
        const jsDoc = getAllJSDoc(param);
        const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
        const contextType = callSignature && checker?.typeToString(callSignature?.getTypeParameterAtPosition(i));
        const computedType = checker?.typeToString(checker?.getTypeAtLocation(param), param) || '';
        const parameter: Parameter = {
            name: param.name.getText(),
            type: jsDocDefinedType
                ? {text: jsDocDefinedType}
                : {text: contextType ?? computedType},
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
