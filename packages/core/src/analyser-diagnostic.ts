import ts from 'typescript';


/**
 * Represents an error caused because of invalid arguments when
 * calling the parse function
 */
export interface ArgumentError {
    messageText: string;
}

export type AnalyserError = ArgumentError | ts.Diagnostic;

/**
 * Internal class to enqueue any error during the analysis.
 *
 * There are two types of errors the analyser can throw:
 *
 * - **Config errors**: Errors because of invalid compiler options
 * - **Syntactic/Semantic errors**: Errors thrown by the TypeScript compiler when parsing the code
 */
export class AnalyserDiagnostic {

    private readonly _diagnostics: ts.Diagnostic[] = [];

    private readonly _formatDiagnosticHost: ts.FormatDiagnosticsHost;

    private readonly _cwd: string;

    constructor(cwd: string) {
        this._cwd = cwd;
        this._formatDiagnosticHost = {
            getCanonicalFileName: (name: string) => name,
            getCurrentDirectory: () => this._cwd,
            getNewLine: () => '\n',
        };
    }

    /**
     * Formats syntactic and semantic errors found during the analysis
     *
     * @param errors
     * @returns The diagnostics formatted
     */
    format(errors: ts.Diagnostic[]): string {
        return ts.formatDiagnosticsWithColorAndContext(errors, this._formatDiagnosticHost);
    }

    /**
     * Used to retrieve all the errors the analyser has encountered
     *
     * @returns All the errors
     */
    getAll(): ts.Diagnostic[] {
        return Array.from(ts.sortAndDeduplicateDiagnostics(this._diagnostics));
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
    flatten(diagnostic: ts.Diagnostic): string {
        return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    }

    /**
     * Adds a new diagnostic error
     *
     * @param node - The node where the error was found
     * @param message - The error message
     */
    addOne(node: ts.Node | null | undefined, message: string | ts.DiagnosticMessageChain): void {
        const error: ts.Diagnostic = {
            file: node?.getSourceFile(),
            start: node?.getStart(),
            length: node?.getWidth(),
            category: ts.DiagnosticCategory.Error,
            messageText: message,
            code: 1000000,
        };

        this._diagnostics.push(error);
    }

    /**
     * Adds multiple syntactic/semantic errors
     *
     * @param diagnostics - An array of syntactic/semantic errors
     */
    addMany(diagnostics: readonly ts.Diagnostic[]): void {
        this._diagnostics.push(...diagnostics);
    }
}
