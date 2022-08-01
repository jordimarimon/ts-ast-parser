import { FunctionLike, FunctionDeclaration, Module, JSDocTagType } from '../models';
import { Options } from '../options';
import { getJSDoc } from '../utils';
import ts from 'typescript';


export function createFunction(
    node: ts.VariableStatement | ts.FunctionDeclaration,
    moduleDoc: Module,
    options: Partial<Options> = {},
): void {
    const tmpl: FunctionDeclaration = {
        ...createFunctionLike(node, options),
        kind: 'function',
    };

    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === tmpl.name);

    if (alreadyExists) {
        return;
    }

    moduleDoc.declarations.push(tmpl);
}

export function createFunctionLike(
    node: ts.VariableStatement | ts.FunctionDeclaration | ts.MethodDeclaration | ts.PropertyDeclaration,
    options: Partial<Options> = {},
): FunctionLike {
    const jsDoc = getJSDoc(node, options.jsDocHandlers);

    return {
        name: node.getText() || '',
        decorators: [],
        description: jsDoc[JSDocTagType.description] ?? '',
        jsDoc,
        return: {
            type: {text: ''},
            description: '',
        },
        async: false,
        parameters: [],
    };
}
