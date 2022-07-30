import { JSDocTagType, Module, VariableDeclaration } from '../models';
import { getDefaultValue, getJSDoc, getType } from '../utils';
import ts from 'typescript';


/**
 * Creates the metadata for a variable statement
 */
export function createVariable(node: ts.VariableStatement, moduleDoc: Module): void {

    for (const declaration of node.declarationList.declarations) {
        const name = declaration?.name?.getText() ?? '';
        const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

        if (alreadyExists) {
            continue;
        }

        const jsDoc = getJSDoc(node);
        const type = jsDoc[JSDocTagType.type];
        const variable: VariableDeclaration = {
            name,
            jsDoc,
            kind: 'variable',
            type: type ? {text: type} : getType(declaration),
            description: jsDoc[JSDocTagType.description] ?? '',
            decorators: [],
            default: jsDoc[JSDocTagType.default] ?? getDefaultValue(declaration),
        };

        moduleDoc.declarations.push(variable);
    }

}
