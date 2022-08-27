import { getAllJSDoc, findJSDoc, isFunctionDeclaration, resolveExpression } from '../utils/index.js';
import { JSDocTagName, Module, VariableDeclaration } from '../models/index.js';
import { NodeFactory } from './node-factory.js';
import { Context } from '../context.js';
import ts from 'typescript';


export const variableFactory: NodeFactory<ts.VariableStatement> = {

    isNode: (node: ts.Node): node is ts.VariableStatement => {
        return !isFunctionDeclaration(node) && ts.isVariableStatement(node);
    },

    create: createVariable,

};

function createVariable(node: ts.VariableStatement, moduleDoc: Module): void {

    const checker = Context.checker;
    const jsDoc = getAllJSDoc(node);

    // If user specifies the type in the JSDoc -> we take it
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;

    const defaultValue = findJSDoc<string>(JSDocTagName.default, jsDoc)?.value;

    for (const declaration of node.declarationList.declarations) {
        const name = declaration?.name?.getText() ?? '';
        const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

        if (alreadyExists) {
            continue;
        }

        // If user specifies the type in the declaration (`const x: string = "Foo";)
        const userDefinedType = declaration.type?.getText();

        // The computed type from the TypeScript TypeChecker (as a last resource)
        const computedType = checker?.typeToString(checker?.getTypeAtLocation(declaration), declaration) || '';

        const variable: VariableDeclaration = {
            kind: 'variable',
            name,
            jsDoc,
            decorators: [],
            type: jsDocDefinedType
                ? {text: jsDocDefinedType}
                : {text: userDefinedType ?? computedType},
            default: defaultValue ?? resolveExpression(declaration.initializer),
        };

        moduleDoc.declarations.push(variable);
    }

}
