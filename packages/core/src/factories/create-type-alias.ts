import { Module, TypeAliasDeclaration } from '../models/index.js';
import { getAllJSDoc, getTypeParameters } from '../utils/index.js';
import ts from 'typescript';


export function createTypeAlias(node: ts.TypeAliasDeclaration, moduleDoc: Module): void {
    const name = node.name?.getText();
    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

    if (alreadyExists) {
        return;
    }

    const tmpl: TypeAliasDeclaration = {
        name,
        kind: 'type-alias',
        value: node.type?.getText(),
        jsDoc: getAllJSDoc(node),
        typeParameters: getTypeParameters(node),
    };

    moduleDoc.declarations.push(tmpl);
}
