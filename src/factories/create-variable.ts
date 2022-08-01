import { JSDocTagType, Module, VariableDeclaration } from '../models';
import { getDefaultValue, getJSDoc } from '../utils';
import { Options } from '../options';
import ts from 'typescript';


/**
 * Creates the metadata for a variable statement
 */
export function createVariable(
    node: ts.VariableStatement,
    checker: ts.TypeChecker,
    moduleDoc: Module,
    options: Partial<Options> = {},
): void {

    for (const declaration of node.declarationList.declarations) {
        const name = declaration?.name?.getText() ?? '';
        const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

        if (alreadyExists) {
            continue;
        }

        const jsDoc = getJSDoc(node, options.jsDocHandlers);
        const type = jsDoc[JSDocTagType.type];
        const checkedType = checker.typeToString(checker.getTypeAtLocation(declaration), declaration);
        const variable: VariableDeclaration = {
            name,
            jsDoc,
            kind: 'variable',
            type: type ? {text: type} : {text: checkedType},
            description: jsDoc[JSDocTagType.description] ?? '',
            decorators: [],
            default: jsDoc[JSDocTagType.default] ?? getDefaultValue(declaration),
        };

        moduleDoc.declarations.push(variable);
    }

}
