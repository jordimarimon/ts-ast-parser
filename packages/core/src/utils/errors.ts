import { getLinePosition } from './get-location.js';
import ts from 'typescript';


export enum DiagnosticCode {
    UNKNOWN = 0,
}

export class AnalyserDiagnostic {

    private readonly _diagnostics: ts.Diagnostic[] = [];

    getAll(): ts.SortedReadonlyArray<ts.Diagnostic> {
        return ts.sortAndDeduplicateDiagnostics(this._diagnostics);
    }

    isEmpty(): boolean {
        return !this._diagnostics.length;
    }

    add(node: ts.Node, message: string): void {
        const diagnostic: ts.Diagnostic = {
            file: node.getSourceFile(),
            start: getLinePosition(node),
            length: node.getWidth(),
            category: ts.DiagnosticCategory.Error,
            messageText: message,
            code: DiagnosticCode.UNKNOWN,
        };

        this._diagnostics.push(diagnostic);
    }

    set(diagnostics: readonly ts.Diagnostic[]): void {
        this._diagnostics.push(...diagnostics);
    }
}
