import { Module } from '../models/index.js';


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
