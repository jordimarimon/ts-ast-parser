import { getAllJSDoc, getLinePosition, getTypeParameters, tryAddProperty } from '../utils/index.js';
import { DeclarationKind, Module, TypeAliasDeclaration } from '../models/index.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';


export const typeAliasFactory: NodeFactory<ts.TypeAliasDeclaration> = {

    isNode: (node: ts.Node): node is ts.TypeAliasDeclaration => ts.isTypeAliasDeclaration(node),

    create: createTypeAlias,

};

function createTypeAlias(node: ts.TypeAliasDeclaration, moduleDoc: Module): void {
    const name = node.name?.getText();
    const tmpl: TypeAliasDeclaration = {
        name,
        line: getLinePosition(node),
        kind: DeclarationKind.typeAlias,
        value: node.type?.getText(),
    };

    tryAddProperty(tmpl, 'jsDoc', getAllJSDoc(node));
    tryAddProperty(tmpl, 'typeParameters', getTypeParameters(node));

    moduleDoc.declarations.push(tmpl);
}
