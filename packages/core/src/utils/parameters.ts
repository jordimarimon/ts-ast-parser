import { JSDocTagName, NamedParameterElement, Parameter } from '../models/index.js';
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


    for (let i = 0; i < originalParameters.length; i++) {
        const param = originalParameters[i];

        if (ts.isObjectBindingPattern(param.name)) {
            parameters.push(createNamedParameter(param, i, callSignature));
        } else {
            parameters.push(createSimpleParameter(param, i, callSignature));
        }
    }

    return parameters;
}

function createSimpleParameter(
    param: ts.ParameterDeclaration,
    position: number,
    callSignature?: ts.Signature,
): Parameter {
    const checker = Context.checker;
    const jsDoc = getAllJSDoc(param);
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const contextType = callSignature && checker?.typeToString(callSignature?.getTypeParameterAtPosition(position));
    const computedType = checker?.typeToString(checker?.getTypeAtLocation(param), param) || '';
    const tmpl: Parameter = {
        name: param.name.getText(),
        type: jsDocDefinedType
            ? {text: jsDocDefinedType}
            : {text: contextType ?? computedType},
    };

    tryAddProperty(tmpl, 'decorators', getDecorators(param));
    tryAddProperty(tmpl, 'jsDoc', jsDoc);
    tryAddProperty(tmpl, 'optional', !!checker?.isOptionalParameter(param));
    tryAddProperty(tmpl, 'default', resolveExpression(param?.initializer));
    tryAddProperty(tmpl, 'rest', !!(param?.dotDotDotToken && param.type?.kind === ts.SyntaxKind.ArrayType));

    return tmpl;
}

function createNamedParameter(
    param: ts.ParameterDeclaration,
    position: number,
    callSignature?: ts.Signature,
): Parameter {
    const checker = Context.checker;
    const jsDoc = getAllJSDoc(param);
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const contextType = callSignature && checker?.typeToString(callSignature?.getTypeParameterAtPosition(position));
    const computedType = checker?.typeToString(checker?.getTypeAtLocation(param), param) || '';
    const tmpl: Parameter = {
        name: '__namedParameter',
        named: true,
        type: jsDocDefinedType
            ? {text: jsDocDefinedType}
            : {text: contextType ?? computedType},
    };
    const bindings = (param.name as ts.ObjectBindingPattern)?.elements ?? [];
    const resultNamedParamElements: NamedParameterElement[] = [];

    for (const binding of bindings) {
        resultNamedParamElements.push(createNamedParameterBinding(binding));
    }

    tryAddProperty(tmpl, 'elements', resultNamedParamElements);
    tryAddProperty(tmpl, 'optional', !!checker?.isOptionalParameter(param));
    tryAddProperty(tmpl, 'jsDoc', jsDoc);

    return tmpl;
}

function createNamedParameterBinding(binding: ts.BindingElement): NamedParameterElement {
    const tmpl: NamedParameterElement = {
        name: binding.name?.getText() || '',
    };

    tryAddProperty(tmpl, 'value', resolveExpression(binding?.initializer));

    return tmpl;
}
