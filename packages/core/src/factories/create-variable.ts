import { DeclarationKind, JSDocTagName, Module, VariableDeclaration } from '../models/index.js';
import { getDecorators } from '../utils/decorator.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';
import {
    findJSDoc,
    getAllJSDoc,
    getTypeName,
    isFunctionDeclaration,
    resolveExpression,
    tryAddProperty,
} from '../utils/index.js';


export const variableFactory: NodeFactory<ts.VariableStatement> = {

    isNode: (node: ts.Node): node is ts.VariableStatement => {
        return !isFunctionDeclaration(node) && ts.isVariableStatement(node);
    },

    create: createVariable,

};

function createVariable(node: ts.VariableStatement, moduleDoc: Module): void {

    const jsDoc = getAllJSDoc(node);
    const decorators = getDecorators(node);
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const defaultValue = findJSDoc<string>(JSDocTagName.default, jsDoc)?.value;

    for (const declaration of node.declarationList.declarations) {
        const name = declaration?.name?.getText() ?? '';
        const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

        if (alreadyExists) {
            continue;
        }

        const tmpl: VariableDeclaration = {
            kind: DeclarationKind.variable,
            name,
            type: jsDocDefinedType ? {text: jsDocDefinedType} : {text: getTypeName(declaration)},
        };

        tryAddProperty(tmpl, 'jsDoc', jsDoc);
        tryAddProperty(tmpl, 'decorators', decorators);
        tryAddProperty(tmpl, 'default', defaultValue ?? resolveExpression(declaration.initializer));

        moduleDoc.declarations.push(tmpl);
    }

}
