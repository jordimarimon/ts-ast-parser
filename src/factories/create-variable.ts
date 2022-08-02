import { getDefaultValue, getAllJSDoc, getType, findJSDoc } from '../utils';
import { JSDocTagName, Module, VariableDeclaration } from '../models';
import ts from 'typescript';


export function createVariable(node: ts.VariableStatement, moduleDoc: Module): void {

    for (const declaration of node.declarationList.declarations) {
        const name = declaration?.name?.getText() ?? '';
        const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

        if (alreadyExists) {
            continue;
        }

        const jsDoc = getAllJSDoc(node);
        const type = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
        const checkedType = getType(declaration);
        const variable: VariableDeclaration = {
            kind: 'variable',
            name,
            jsDoc,
            type: type ? {text: type} : {text: checkedType},
            decorators: [],
            default: findJSDoc<string>(JSDocTagName.default, jsDoc)?.value ?? getDefaultValue(declaration),
        };

        moduleDoc.declarations.push(variable);
    }

}
