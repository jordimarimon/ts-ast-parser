import ts from 'typescript';


export function getReturnStatement(node: ts.Block | undefined): ts.ReturnStatement | undefined {
    return node?.statements.find(ts.isReturnStatement);
}
