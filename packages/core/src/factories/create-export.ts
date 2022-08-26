import { extractMixinNodes, hasDefaultKeyword, hasExportKeyword } from '../utils/index.js';
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
    const mixinNodes = extractMixinNodes(node);

    if (mixinNodes !== null) {
        // TODO(Jordi M.): Add export for mixins
        return;
    }

    if (ts.isVariableStatement(node)) {
        for (const declaration of node.declarationList.declarations) {
            moduleDoc.exports.push({
                name: declaration?.name?.getText() ?? '',
                type: isDefault ? ExportType.default : ExportType.named,
                isTypeOnly: false,
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
            isTypeOnly: false,
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
        isTypeOnly: false,
    });
}

function createExportFromPreviousDeclaration(node: ts.ExportDeclaration, moduleDoc: Module): void {
    // Case when one exports previous declared declarations
    const isNamed = node.exportClause && ts.isNamedExports(node.exportClause);

    // CASE of "export { x, y as z };"
    if (isNamed) {
        for (const el of (node.exportClause.elements ?? [])) {
            const exp: Export = {
                name: el.name?.escapedText ?? '',
                type: ExportType.named,
                isTypeOnly: node.isTypeOnly ?? false,
            };

            // case where the "as" keyword is being used
            if (el.propertyName?.escapedText) {
                exp.referenceName = el.propertyName?.escapedText;
            }

            moduleDoc.exports.push(exp);
        }
    }
}
