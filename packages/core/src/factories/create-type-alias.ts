import { Module, TypeAliasDeclaration } from '../models/index.js';
import { getAllJSDoc } from '../utils/index.js';
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
        typeParameters: node.typeParameters?.map(t => t.name?.getText() || '').filter(x => x) ?? [],
    };

    moduleDoc.declarations.push(tmpl);
}
