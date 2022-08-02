import { JSDocTagName, Module, VariableDeclaration } from '../models';
import { getDefaultValue, collectJSDoc, getType, findJSDoc } from '../utils';
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

        const jsDoc = collectJSDoc(node);
        const type = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
        const checkedType = getType(declaration);
        const variable: VariableDeclaration = {
            name,
            jsDoc,
            kind: 'variable',
            type: type ? {text: type} : {text: checkedType},
            description: findJSDoc<string>(JSDocTagName.description, jsDoc)?.value ?? '',
            decorators: [],
            default: findJSDoc<string>(JSDocTagName.default, jsDoc)?.value ?? getDefaultValue(declaration),
        };

        moduleDoc.declarations.push(variable);
    }

}
