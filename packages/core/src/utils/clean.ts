import { ClassDeclaration, Constructor, ModifierType } from '../models/class.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { FunctionSignature } from '../models/function.js';
import { Module } from '../models/module.js';
import { shouldIgnore } from './js-doc.js';


export function clean(reflectedModule: Module): void {
    let i = reflectedModule.declarations.length;

    removeDuplicateExports(reflectedModule);

    while (i--) {
        cleanDeclaration(i, reflectedModule);
    }
}

function removeDuplicateExports(reflectedModule: Module): void {
    reflectedModule.exports = reflectedModule.exports.filter((value, index, exports) => {
        return index === exports.findIndex(e => e.name === value.name && e.kind === value.kind);
    });
}

function cleanDeclaration(index: number, reflectedModule: Module): void {
    const decl = reflectedModule.declarations[index];

    // If the export has an "AS" keyword, we need to use the "originalName"
    const exportIdx = reflectedModule.exports.findIndex(exp => (exp.originalName || exp.name) === decl.name);

    if (exportIdx === -1 || shouldIgnore(decl)) {
        reflectedModule.declarations.splice(index, 1);

        if (exportIdx !== -1) {
            reflectedModule.exports.splice(exportIdx, 1);
        }
    }

    if (decl.kind === DeclarationKind.Class) {
        removeNonPublicClassElements(decl);
    }

    if (decl.kind === DeclarationKind.Function) {
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

        if (member?.kind === DeclarationKind.Method) {
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
