import { Module } from './module';
import ts from 'typescript';


export interface MixinNodes {
    function: ts.FunctionDeclaration | ts.VariableStatement;
    class: ts.ClassExpression | ts.ClassDeclaration;
}

export interface CollectResults {
    modules: Module[];
    sourceFiles: (ts.SourceFile | undefined)[];
}
