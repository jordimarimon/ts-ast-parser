import { getTypeInfoFromNode, getTypeInfoFromTsType } from './get-type.js';
import { NamedParameterElement, Parameter } from '../models/parameter.js';
import { resolveExpression } from './resolve-expression.js';
import { tryAddProperty } from './try-add-property.js';
import { findJSDoc, getAllJSDoc } from './js-doc.js';
import { JSDocTagName } from '../models/js-doc.js';
import { NodeWithParameters } from './types.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function getParameters(node: NodeWithParameters, callSignature: ts.Signature): Parameter[] {
    // In class methods, we use the type from the call
    // signature to resolve types based on implementation in cases where
    // the methods uses typed parameters

    const parameters: Parameter[] = [];
    const nodeParameters = node?.parameters ?? [];
    const symbolParameters = callSignature.parameters ?? [];

    for (let i = 0; i < symbolParameters.length; i++) {
        const nodeParam = nodeParameters[i];
        const symbolParam = symbolParameters[i];

        if (ts.isObjectBindingPattern(nodeParam.name)) {
            parameters.push(createNamedParameter(nodeParam, symbolParam));
        } else {
            parameters.push(createSimpleParameter(nodeParam, symbolParam));
        }
    }

    return parameters;
}

function createSimpleParameter(nodeParam: ts.ParameterDeclaration, symbolParam: ts.Symbol): Parameter {
    const checker = Context.checker;
    const jsDoc = getAllJSDoc(nodeParam);
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const type = checker?.getTypeOfSymbolAtLocation(symbolParam, nodeParam);

    const tmpl: Parameter = {
        name: symbolParam.getName() ?? '',
        type: jsDocDefinedType
            ? {text: jsDocDefinedType}
            : (type ? getTypeInfoFromTsType(type) : getTypeInfoFromNode(nodeParam)),
    };

    // tryAddProperty(tmpl, 'decorators', getDecorators(nodeParam));
    tryAddProperty(tmpl, 'jsDoc', jsDoc);
    tryAddProperty(tmpl, 'optional', !!checker?.isOptionalParameter(nodeParam));
    tryAddProperty(tmpl, 'default', resolveExpression(nodeParam?.initializer));
    tryAddProperty(tmpl, 'rest', !!(nodeParam?.dotDotDotToken && nodeParam.type?.kind === ts.SyntaxKind.ArrayType));

    return tmpl;
}

function createNamedParameter(nodeParam: ts.ParameterDeclaration, symbolParam: ts.Symbol): Parameter {
    const checker = Context.checker;
    const jsDoc = getAllJSDoc(nodeParam);
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const contextType = checker?.typeToString(checker?.getTypeOfSymbolAtLocation(symbolParam, nodeParam));
    const computedType = checker?.typeToString(checker?.getTypeAtLocation(nodeParam), nodeParam) || '';
    const tmpl: Parameter = {
        name: '__namedParameter',
        named: true,
        type: jsDocDefinedType
            ? {text: jsDocDefinedType}
            : {text: contextType ?? computedType},
    };
    const bindings = (nodeParam.name as ts.ObjectBindingPattern)?.elements ?? [];
    const resultNamedParamElements: NamedParameterElement[] = [];

    for (const binding of bindings) {
        resultNamedParamElements.push(createNamedParameterBinding(binding));
    }

    tryAddProperty(tmpl, 'elements', resultNamedParamElements);
    tryAddProperty(tmpl, 'optional', !!checker?.isOptionalParameter(nodeParam));
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
