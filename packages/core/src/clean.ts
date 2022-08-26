import { ClassDeclaration, ModifierType, Module } from './models/index.js';
import { shouldIgnore } from './utils/index.js';


export function clean(moduleDocs: Module[]): void {
    for (const moduleDoc of moduleDocs) {
        let i = moduleDoc.declarations.length;

        while (i--) {
            const decl = moduleDoc.declarations[i];

            // If the export has an "AS" keyword, we need to use the "referenceName"
            const exportIdx = moduleDoc.exports.findIndex(exp => (exp.referenceName || exp.name) === decl.name);

            if (exportIdx === -1 || shouldIgnore(decl)) {
                moduleDoc.declarations.splice(i, 1);

                if (exportIdx !== -1) {
                    moduleDoc.exports.splice(exportIdx, 1);
                }
            }

            if (decl.kind === 'class') {
                removeNonPublicClassMembers(decl);
            }

            // TODO(Jordi M.): Remove function/class-method parameters that have @ignore or @internal JSDoc tags
        }
    }
}

export function removeNonPublicClassMembers(declaration: ClassDeclaration): void {
    let i = declaration.members?.length ?? 0;

    while (i--) {
        const member = declaration.members?.[i];
        const isNotPublic = member?.modifier !== ModifierType.public || shouldIgnore(member);

        if (isNotPublic) {
            declaration.members?.splice(i, 1);
        }
    }
}
