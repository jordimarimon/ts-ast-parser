import * as path from 'path';
import {
    ClassDeclaration,
    Declaration,
    DeclarationKind,
    InterfaceDeclaration,
    Module,
    SourceReference,
} from './models/index.js';


export function link(modules: Module[]): void {

    for (const module of modules) {
        for (const decl of module.declarations) {
            convertAbsolutePathToRelative(decl);

            // TODO(Jordi M.): Resolve initializers that are identifiers
        }
    }

}

function convertAbsolutePathToRelative(decl: Declaration): void {
    if (decl.kind === DeclarationKind.class) {
        convertClassAbsolutePathToRelative(decl);
    }

    if (decl.kind === DeclarationKind.interface) {
        convertInterfaceAbsolutePathToRelative(decl);
    }
}

function convertClassAbsolutePathToRelative(decl: ClassDeclaration): void {
    const heritageClauses = decl.heritage ?? [];
    const decorators = decl.decorators ?? [];
    const members = decl.members ?? [];

    for (const heritageClause of heritageClauses) {
        normalizePath(heritageClause);
    }

    for (const decorator of decorators) {
        normalizePath(decorator);
    }

    for (const member of members) {
        const memberDecorators = member.decorators ?? [];

        for (const decorator of memberDecorators) {
            normalizePath(decorator);
        }
    }
}

function convertInterfaceAbsolutePathToRelative(decl: InterfaceDeclaration): void {
    const heritageClauses = decl.heritage ?? [];

    for (const heritageClause of heritageClauses) {
        normalizePath(heritageClause);
    }
}

function normalizePath(prop: {href?: SourceReference}): void {
    if (!prop.href?.path) {
        return;
    }

    prop.href.path = path.normalize(path.relative(process.cwd(), prop.href.path));
}
