import { DeclarationKind, EnumDeclaration, EnumMember, Module } from '../models/index.js';
import { getAllJSDoc, tryAddProperty } from '../utils/index.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';


export const enumFactory: NodeFactory<ts.EnumDeclaration> = {

    isNode: isEnum,

    create: createEnum,

};

function isEnum(node: ts.Node): node is ts.EnumDeclaration {
    return ts.isEnumDeclaration(node);
}

function createEnum(node: ts.EnumDeclaration, moduleDoc: Module): void {
    const name = node.name?.getText();
    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

    if (alreadyExists) {
        return;
    }

    const tmpl: EnumDeclaration = {
        kind: DeclarationKind.enum,
        name,
    };

    tryAddProperty(tmpl, 'members', getEnumMembers(node));
    tryAddProperty(tmpl, 'jsDoc', getAllJSDoc(node));

    moduleDoc.declarations.push(tmpl);
}

function getEnumMembers(node: ts.EnumDeclaration): EnumMember[] {
    const members: EnumMember[] = [];

    let defaultInitializer = 0;

    for (const member of node.members) {
        const name = member.name?.getText();

        let value: string | number = member.initializer?.getText() ?? '';

        if (value !== '') {
            const possibleNumericValue = parseInt(value);

            if (!isNaN(possibleNumericValue)) {
                defaultInitializer = possibleNumericValue + 1;
                value = possibleNumericValue;
            }
        } else {
            value = defaultInitializer++;
        }

        members.push({name, value});
    }

    return members;
}
