import { hasDefaultKeyword, hasExportKeyword, tryAddProperty } from '../utils/index.js';
import { Export, ExportType, Module } from '../models/index.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';


export const exportKeywordFactory: NodeFactory = {

    isNode: hasExportKeyword,

    create: createExportFromCurrentDeclaration,

};

export const exportAssignmentFactory: NodeFactory<ts.ExportAssignment> = {

    isNode: (node: ts.Node): node is ts.ExportAssignment => ts.isExportAssignment(node),

    create: createExportFromAssignment,

};

export const exportDeclarationFactory: NodeFactory<ts.ExportDeclaration> = {

    isNode: (node: ts.Node): node is ts.ExportDeclaration => ts.isExportDeclaration(node),

    create: createExportFromPreviousDeclaration,

};

function createExportFromCurrentDeclaration(node: ts.Node, moduleDoc: Module): void {
    // CASE of:
    //      export const x = 4;
    //      export class Foo {}
    //      export default class Foo {}
    //      ...

    const isDefault = hasDefaultKeyword(node);

    if (ts.isVariableStatement(node)) {
        for (const declaration of node.declarationList.declarations) {
            moduleDoc.exports.push({
                name: declaration?.name?.getText() ?? '',
                type: isDefault ? ExportType.default : ExportType.named,
            });
        }
        return;
    }

    if (
        ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isEnumDeclaration(node) ||
        ts.isTypeAliasDeclaration(node)
    ) {
        moduleDoc.exports.push({
            name: node?.name?.getText() ?? '',
            type: isDefault ? ExportType.default : ExportType.named,
        });
    }
}

function createExportFromAssignment(node: ts.ExportAssignment, moduleDoc: Module): void {
    // Case of:
    //      export default 4;
    //      export = class Foo {};
    moduleDoc.exports.push({
        name: node.expression?.getText(),
        type: node.isExportEquals ? ExportType.equals : ExportType.default,
    });
}

function createExportFromPreviousDeclaration(node: ts.ExportDeclaration, moduleDoc: Module): void {
    // Case when one exports previous declared declarations
    const isNamed = node.exportClause && ts.isNamedExports(node.exportClause);
    const isNamespaced = node.exportClause && ts.isNamespaceExport(node.exportClause);
    const isReexport = node?.moduleSpecifier !== undefined;
    const moduleSpecifier = node.moduleSpecifier?.getText() ?? '';

    if (isNamed) { // CASE of "export { x, y as z };"
        for (const el of (node.exportClause.elements ?? [])) {
            const exp: Export = {
                name: el.name?.escapedText ?? '',
                type: ExportType.named,
            };

            tryAddProperty(exp, 'module', moduleSpecifier);
            tryAddProperty(exp, 'isTypeOnly', node.isTypeOnly ?? false);

            // case where the "as" keyword is being used
            if (el.propertyName?.escapedText) {
                exp.referenceName = el.propertyName?.escapedText;
            }

            moduleDoc.exports.push(exp);
        }
    } else if (isNamespaced) {
        const exp: Export = {
            name: node.exportClause.name?.escapedText ?? '',
            type: ExportType.namespace,
        };

        tryAddProperty(exp, 'module', moduleSpecifier);

        moduleDoc.exports.push(exp);
    } else if (isReexport) { // CASE export * from './foo.js';
        moduleDoc.exports.push({
            name: '*',
            type: ExportType.star,
            module: moduleSpecifier,
        });
    }

}
