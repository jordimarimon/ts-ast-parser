import ts from 'typescript';


type ConstructWithTypeParameter = ts.TypeAliasDeclaration |
    ts.InterfaceDeclaration |
    ts.ClassDeclaration |
    ts.FunctionDeclaration |
    ts.ArrowFunction |
    ts.MethodSignature |
    ts.FunctionTypeNode |
    ts.FunctionExpression |
    null;

export const isNotEmptyArray = <T = unknown[]>(arr: unknown): arr is T => Array.isArray(arr) && arr.length > 0;

export function isStaticMember(member: ts.PropertyDeclaration | ts.MethodDeclaration): boolean {
    return !!member?.modifiers?.some?.(x => x.kind === ts.SyntaxKind.StaticKeyword);
}

export function isFunctionDeclaration(node: ts.Node): node is ts.FunctionDeclaration | ts.VariableStatement {
    // Case of:
    //
    //      function name(...) { ... }
    //
    if (ts.isFunctionDeclaration(node)) {
        return true;
    }

    // If it's not a function declaration, we only care about case like:
    //
    //      const name = (...) => { ... };
    //

    if (!ts.isVariableStatement(node)) {
        return false;
    }

    const declaration = node.declarationList?.declarations?.[0];

    if (!declaration) {
        return false;
    }

    const initializer = declaration.initializer;

    return !!initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
}

export function getDefaultValue(node: ts.VariableDeclaration | ts.PropertyDeclaration): string {
    const expr = node.initializer;

    let defaultValue: string | undefined;

    if (expr != undefined && ts.isAsExpression(expr)) {
        defaultValue = expr?.expression?.getText();
    } else {
        defaultValue = expr?.getText();
    }

    return defaultValue ?? '';
}

export function getTypeParameters(node: ConstructWithTypeParameter): string[] {
    return node?.typeParameters?.map(t => t.name?.getText() || '').filter(x => x) ?? [];
}