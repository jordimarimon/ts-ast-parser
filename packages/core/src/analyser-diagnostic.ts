import { getLinePosition } from './utils/get-location.js';
import ts from 'typescript';


export enum DiagnosticCode {
    UNKNOWN = 1000000,
}

export enum DiagnosticErrorType {
    SEMANTIC,
    COMMAND_LINE,
    ARGUMENT,
}

export interface SemanticError {
    kind: DiagnosticErrorType;
    category: ts.DiagnosticCategory;
    code: number;
    file: ts.SourceFile | undefined;
    start: number | undefined;
    length: number | undefined;
    messageText: string | ts.DiagnosticMessageChain;
}

export interface CommandLineError {
    kind: DiagnosticErrorType;
    messageText: string | ts.DiagnosticMessageChain;
}

export interface ArgumentError {
    kind: DiagnosticErrorType;
    messageText: string | ts.DiagnosticMessageChain;
}

export type DiagnosticError = SemanticError | CommandLineError | ArgumentError;

export class AnalyserDiagnostic {

    private readonly _diagnostics: DiagnosticError[] = [];

    getAll(): DiagnosticError[] {
        return this._diagnostics;
    }

    isEmpty(): boolean {
        return !this._diagnostics.length;
    }

    add(kind: DiagnosticErrorType, message: string | ts.DiagnosticMessageChain, node?: ts.Node): void {
        let error: DiagnosticError;

        if (kind === DiagnosticErrorType.SEMANTIC && node) {
            error = {
                kind: DiagnosticErrorType.SEMANTIC,
                file: node.getSourceFile(),
                start: getLinePosition(node),
                length: node.getWidth(),
                category: ts.DiagnosticCategory.Error,
                messageText: message,
                code: DiagnosticCode.UNKNOWN,
            };
        } else {
            error = {kind, messageText: message};
        }

        this._diagnostics.push(error);
    }

    addMany(diagnostics: readonly ts.Diagnostic[]): void {
        this._diagnostics.push(...diagnostics.map(d => ({...d, kind: DiagnosticErrorType.SEMANTIC})));
    }
}
