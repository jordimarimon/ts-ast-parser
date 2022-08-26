import { getAllJSDoc, getTypeParameters } from '../utils/index.js';
import { Module, TypeAliasDeclaration } from '../models/index.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';


export const typeAliasFactory: NodeFactory<ts.TypeAliasDeclaration> = {

    isNode: (node: ts.Node): node is ts.TypeAliasDeclaration => ts.isTypeAliasDeclaration(node),

    create: createTypeAlias,

};

function createTypeAlias(node: ts.TypeAliasDeclaration, moduleDoc: Module): void {
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
