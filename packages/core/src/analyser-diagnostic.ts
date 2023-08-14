import ts from 'typescript';


export interface ArgumentError {
    messageText: string;
}

export type AnalyserError = ArgumentError | ts.Diagnostic;

export class AnalyserDiagnostic {

    private readonly _diagnostics: ts.Diagnostic[] = [];

    private readonly _argumentErrors: ArgumentError[] = [];

    private readonly _cwd: string;

    constructor(cwd: string) {
        this._cwd = cwd;
    }

    formatDiagnostics(): string {
        const diagnosticsHost: ts.FormatDiagnosticsHost = {
            getCanonicalFileName: (name: string) => name,
            getCurrentDirectory: () => this._cwd,
            getNewLine: () => '\n',
        };

        return ts.formatDiagnosticsWithColorAndContext(this._diagnostics, diagnosticsHost);
    }

    getAll(): (ArgumentError | ts.Diagnostic)[] {
        return [
            ...this._argumentErrors,
            ...ts.sortAndDeduplicateDiagnostics(this._diagnostics),
        ];
    }

    isEmpty(): boolean {
        return !this._diagnostics.length;
    }

    flattenMessage(diagnostic: ts.Diagnostic): string {
        return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    }

    addDiagnostic(node: ts.Node, message: string | ts.DiagnosticMessageChain): void {
        const error: ts.Diagnostic = {
            file: node.getSourceFile(),
            start: node.getStart(),
            length: node.getWidth(),
            category: ts.DiagnosticCategory.Error,
            messageText: message,
            code: 1000000,
        };

        this._diagnostics.push(error);
    }

    addArgumentError(messageText: string): void {
        this._argumentErrors.push({messageText});
    }

    addManyDiagnostics(diagnostics: readonly ts.Diagnostic[]): void {
        this._diagnostics.push(...diagnostics);
    }
}
