import ts from 'typescript';


/**
 * Represents an error caused because of invalid arguments when
 * calling the parse function
 */
export interface ArgumentError {
    messageText: string;
}

/**
 * There are three types of errors:
 *
 * - **Invalid argument error**: Errors caused because of invalid arguments when calling the parse function
 * - **Config errors**: Errors caused because of invalid compiler options
 * - **Syntactic/Semantic errors**: Errors thrown by the TypeScript compiler when parsing the code
 */
export type AnalyserError = ArgumentError | ts.Diagnostic;

/**
 * Internal class to enqueue any error during the analysis
 */
export class AnalyserDiagnostic {

    private readonly _diagnostics: ts.Diagnostic[] = [];

    private readonly _argumentErrors: ArgumentError[] = [];

    private readonly _cwd: string;

    constructor(cwd: string) {
        this._cwd = cwd;
    }

    /**
     * Formats syntactic and semantic errors found during the analysis
     *
     * @returns The diagnostics formatted
     */
    formatDiagnostics(): string {
        const diagnosticsHost: ts.FormatDiagnosticsHost = {
            getCanonicalFileName: (name: string) => name,
            getCurrentDirectory: () => this._cwd,
            getNewLine: () => '\n',
        };

        return ts.formatDiagnosticsWithColorAndContext(this._diagnostics, diagnosticsHost);
    }

    /**
     * Used to retrieve all the errors the analyser has encountered
     *
     * @returns All the errors
     */
    getAll(): (ArgumentError | ts.Diagnostic)[] {
        return [
            ...this._argumentErrors,
            ...ts.sortAndDeduplicateDiagnostics(this._diagnostics),
        ];
    }

    /**
     * Checks whether there are errors or not
     *
     * @returns True if there are no errors, otherwise false
     */
    isEmpty(): boolean {
        return !this._diagnostics.length;
    }

    /**
     * A message may be a chain of multiple messages. This helps provide better
     * context for an error. This function flattens the chain of messages
     *
     * @param diagnostic - The error to flatten
     * @returns The messages flattened
     */
    flattenMessage(diagnostic: ts.Diagnostic): string {
        return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    }

    /**
     * Adds a new diagnostic error
     *
     * @param node - The node where the error was found
     * @param message - The error message
     */
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

    /**
     * Adds a new invalid argument error
     *
     * @param messageText - The error message
     */
    addArgumentError(messageText: string): void {
        this._argumentErrors.push({messageText});
    }

    /**
     * Adds multiple syntactic/semantic errors
     *
     * @param diagnostics - An array of syntactic/semantic errors
     */
    addManyDiagnostics(diagnostics: readonly ts.Diagnostic[]): void {
        this._diagnostics.push(...diagnostics);
    }
}
