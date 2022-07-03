import { JSDocTagType, Module, VariableDeclaration } from '../models';
import { getDefaultValue, getType } from '../utils';
import ts from 'typescript';
import { getJSDoc } from '../utils/js-doc';


/**
 * Creates the metadata for a variable statement
 */
export function createVariable(node: ts.VariableStatement, moduleDoc: Module): void {

    for (const declaration of node.declarationList.declarations) {
        const name = declaration?.name?.getText() ?? '';
        const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

        if (!alreadyExists) {
            const variable: VariableDeclaration = {
                name,
                kind: 'variable',
                type: getType(declaration),
                description: getJSDoc(declaration, [JSDocTagType.DESCRIPTION])[0]?.value ?? '',
                decorators: [],
                default: getDefaultValue(declaration),
            };

            moduleDoc.declarations.push(variable);
        }
    }

}
