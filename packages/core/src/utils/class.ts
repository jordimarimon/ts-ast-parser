import ts from 'typescript';


export function isClassDeclaration(node: ts.Node): node is ts.ClassDeclaration | ts.VariableStatement {
    if (ts.isClassDeclaration(node)) {
        return true;
    }

    if (!ts.isVariableStatement(node)) {
        return false;
    }

    const declaration = node.declarationList?.declarations?.[0];

    if (!declaration) {
        return false;
    }

    const initializer = declaration.initializer;

    //
    // case of:
    //
    //      const Foo = class {}
    //
    return !!initializer && ts.isClassExpression(initializer);
}
