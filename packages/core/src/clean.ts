import { shouldIgnore } from './utils/index.js';
import {
    ClassDeclaration,
    ClassMethod,
    Constructor,
    DeclarationKind,
    FunctionDeclaration,
    ModifierType,
    Module,
} from './models/index.js';


export function clean(moduleDocs: Module[]): void {
    for (const moduleDoc of moduleDocs) {
        let i = moduleDoc.declarations.length;

        while (i--) {
            cleanDeclaration(i, moduleDoc);
        }
    }
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
        removeNonPublicParameters(decl);
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
            removeNonPublicParameters(member);
        }
    }

    const constructors = declaration.constructors ?? [];

    for (const ctor of constructors) {
        removeNonPublicParameters(ctor);
    }
}

function removeNonPublicParameters(declaration: FunctionDeclaration | ClassMethod | Constructor): void {
    let i = declaration.parameters?.length ?? 0;

    while (i--) {
        const param = declaration.parameters?.[i];

        if (shouldIgnore(param)) {
            declaration.parameters?.splice(i, 1);
        }
    }
}
