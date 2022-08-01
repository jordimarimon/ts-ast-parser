import { Module } from '../models';


/**
 * Removes all declarations that are not being exported.
 *
 * Any declaration that is not exported, can't be used outside the module.
 * There is no point on documenting non public declarations.
 *
 * @param moduleDoc - The metadata of the module
 */
export function removeNonExportableDeclarations(moduleDoc: Module): void {
    let i = moduleDoc.declarations.length;

    while (i--) {
        const decl = moduleDoc.declarations[i];

        // If the export has an "AS" keyword, we need to use the "referenceName"
        if (!moduleDoc.exports.some(exp => (exp.referenceName || exp.name) === decl.name)) {
            moduleDoc.declarations.splice(i, 1);
        }
    }
}
