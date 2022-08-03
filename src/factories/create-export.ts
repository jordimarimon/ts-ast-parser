import { extractMixinNodes, hasDefaultKeyword, hasExportKeyword } from '../utils';
import { Export, ExportType, Module } from '../models';
import ts from 'typescript';


export function createExport(node: ts.Node, moduleDoc: Module): void {

    // CASE of:
    //      export const x = 4;
    //      export class Foo {}
    //      export default class Foo {}
    //      ...
    if (hasExportKeyword(node)) {
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
            return;
        }

        return;
    }

    // Case of:
    //      export default 4;
    //      export = class Foo {};
    if (ts.isExportAssignment(node)) {
        moduleDoc.exports.push({
            name: node.expression?.getText(),
            type: node.isExportEquals ? ExportType.equals : ExportType.default,
            isTypeOnly: false,
        });
        return;
    }

    // Case when one exports previous declared declarations
    if (ts.isExportDeclaration(node)) {
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


}
