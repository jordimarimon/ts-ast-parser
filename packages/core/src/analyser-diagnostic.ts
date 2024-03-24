import type { AnalyserSystem } from './system/analyser-system.js';
import ts from 'typescript';


/**
 * Represents an error caused because of invalid arguments when
 * calling the parse function
 */
export interface ArgumentError {
    messageText: string;
}

export type AnalyserError = ArgumentError | ts.Diagnostic;

type ErrorMessage = string | ts.DiagnosticMessageChain;

export function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

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

    constructor(system: AnalyserSystem) {
        this._formatDiagnosticHost = {
            getCanonicalFileName: (name: string) => name,
            getCurrentDirectory: () => system.getCurrentDirectory(),
            getNewLine: () => system.newLine,
        };
    }

    /**
     * Formats syntactic and semantic errors found during the analysis
     *
     * @param errors
     * @returns The diagnostics formatted
     */
    format(errors: ts.Diagnostic | ts.Diagnostic[]): string {
        return ts.formatDiagnosticsWithColorAndContext(
            Array.isArray(errors) ? errors : [errors],
            this._formatDiagnosticHost,
        );
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
    addOne(node: ts.Node | null | undefined, message: ErrorMessage): void {
        this._diagnostics.push(this.create(node, message));
    }

    /**
     * Adds multiple syntactic/semantic errors
     *
     * @param diagnostics - An array of syntactic/semantic errors
     */
    addMany(diagnostics: readonly ts.Diagnostic[]): void {
        this._diagnostics.push(...diagnostics);
    }

    /**
     *
     * @param node
     * @param message
     */
    create(node: ts.Node | null | undefined, message: ErrorMessage): ts.Diagnostic {
        return {
            file: node?.getSourceFile(),
            start: node?.getStart(),
            length: node?.getWidth(),
            category: ts.DiagnosticCategory.Error,
            messageText: message,
            code: 1000000,
        };
    }
}
