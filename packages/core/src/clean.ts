import { shouldIgnore } from './utils/index.js';
import {
    ClassDeclaration,
    Constructor,
    DeclarationKind,
    FunctionSignature,
    ModifierType,
    Module,
} from './models/index.js';


export function clean(moduleDocs: Module[]): void {
    for (const moduleDoc of moduleDocs) {
        let i = moduleDoc.declarations.length;

        removeDuplicateExports(moduleDoc);

        while (i--) {
            cleanDeclaration(i, moduleDoc);
        }
    }
}

function removeDuplicateExports(moduleDoc: Module): void {
    moduleDoc.exports = moduleDoc.exports.filter((value, index, exports) => {
        return index === exports.findIndex(e => e.name === value.name && e.type === value.type);
    });
}

function cleanDeclaration(index: number, moduleDoc: Module): void {
    const decl = moduleDoc.declarations[index];

    // If the export has an "AS" keyword, we need to use the "referenceName"
    const exportIdx = moduleDoc.exports.findIndex(exp => (exp.referenceName || exp.name) === decl.name);

    if (exportIdx === -1 || shouldIgnore(decl)) {
        moduleDoc.declarations.splice(index, 1);

        if (exportIdx !== -1) {
            moduleDoc.exports.splice(exportIdx, 1);
        }
    }

    if (decl.kind === DeclarationKind.class) {
        removeNonPublicClassElements(decl);
    }

    if (decl.kind === DeclarationKind.function) {
        for (const signature of decl.signatures) {
            removeNonPublicParameters(signature);
        }
    }
}

function removeNonPublicClassElements(declaration: ClassDeclaration): void {
    let i = declaration.members?.length ?? 0;

    while (i--) {
        const member = declaration.members?.[i];
        const isNotPublic = member?.modifier !== ModifierType.public || shouldIgnore(member);

        if (isNotPublic) {
            declaration.members?.splice(i, 1);
        }

        if (member?.kind === DeclarationKind.method) {
            for (const signature of member.signatures) {
                removeNonPublicParameters(signature);
            }
        }
    }

    const constructors = declaration.constructors ?? [];

    for (const ctor of constructors) {
        removeNonPublicParameters(ctor);
    }
}

function removeNonPublicParameters(declaration: FunctionSignature | Constructor): void {
    let i = declaration.parameters?.length ?? 0;

    while (i--) {
        const param = declaration.parameters?.[i];

        if (shouldIgnore(param)) {
            declaration.parameters?.splice(i, 1);
        }
    }
}
