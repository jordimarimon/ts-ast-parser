import { isBrowser } from '../context.js';
import ts from 'typescript';
import chalk from 'chalk';


// FIXME(Jordi M.): Create an `ErrorDiagnostic` class where we can add all the errors we find
//  during the analysis and at the end, when we're done analysing the project, we output them all together.

//
// The following functions are used to log messages to console
//

const LIB_PREFIX = '[TS AST PARSER]';


export function logWarning(message: string, payload?: unknown): void {
    console.log(chalk.yellow(`${LIB_PREFIX}: ${message}`));

    if (payload != null) {
        console.warn(payload);
    }
}

export function logError(message: string, payload?: unknown): void {
    console.log(chalk.red(`${LIB_PREFIX}: ${message}`));

    if (payload != null) {
        console.error(payload);
    }
}

export function logInfo(message: string): void {
    console.log(chalk.blue(`${LIB_PREFIX}: ${message}`));
}

export function formatDiagnostics(diagnostics: readonly ts.Diagnostic[]): string {
    const diagnosticsHost: ts.FormatDiagnosticsHost = {
        getCanonicalFileName(name: string): string {
            return name;
        },
        getCurrentDirectory(): string {
            if (isBrowser) {
                return '';
            }

            return process.cwd();
        },
        getNewLine(): string {
            return '\n';
        },
    };

    return ts.formatDiagnosticsWithColorAndContext(diagnostics, diagnosticsHost);
}
