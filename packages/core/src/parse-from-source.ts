import { AnalyserDiagnostic, DiagnosticErrorType } from './analyser-diagnostic.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import type { AnalyserResult } from './analyser-result.js';
import { ModuleNode } from './nodes/module-node.js';
import type { AnalyserContext } from './context.js';
import { isBrowser } from './context.js';
import ts from 'typescript';

/**
 * Reflects a simplified version of the TypeScript Abstract
 * Syntax Tree from a TypeScript code snippet
 *
 * @param source - A string that represents the TypeScript source code
 * @param options - Options to configure the analyzer
 *
 * @returns The reflected TypeScript AST
 */
export async function parseFromSource(
    source: string,
    options: Partial<AnalyserOptions> = {},
): Promise<AnalyserResult<ModuleNode>> {
    if (!source) {
        return {
            result: null,
            errors: [{ kind: DiagnosticErrorType.ARGUMENT, messageText: 'Source code is empty.' }],
        };
    }

    const fileName = '/unknown.ts';

    let system: AnalyserSystem;

    if (isBrowser) {
        system = await import('./browser-system.js').then(m => {
            return m.BrowserSystem.create({
                fsMap: new Map<string, string>([[fileName, source]]),
                analyserOptions: options,
            });
        });
    } else {
        system = await import('./node-system.js').then(m => {
            return new m.NodeSystem({
                vfs: true,
                fsMap: new Map<string, string>([[fileName, source]]),
                analyserOptions: options,
            });
        });
    }

    const commandLine = system.getCommandLine();
    const compilerHost = system.getCompilerHost();
    const program = ts.createProgram({
        rootNames: commandLine.fileNames,
        options: commandLine.options,
        host: compilerHost,
    });
    const sourceFile = program.getSourceFile(fileName);

    const analyserDiagnostic = new AnalyserDiagnostic();
    analyserDiagnostic.addMany(program.getSemanticDiagnostics());

    if (!options.skipDiagnostics && !analyserDiagnostic.isEmpty()) {
        return { result: null, errors: analyserDiagnostic.getAll() };
    }

    commandLine.errors.forEach(err => {
        analyserDiagnostic.add(DiagnosticErrorType.COMMAND_LINE, err.messageText);
    });

    if (commandLine.errors.length > 0) {
        return { result: null, errors: analyserDiagnostic.getAll() };
    }

    if (!sourceFile) {
        analyserDiagnostic.add(DiagnosticErrorType.COMMAND_LINE, 'Unable to analyse source code.');
        return { result: null, errors: analyserDiagnostic.getAll() };
    }

    const context: AnalyserContext = {
        program,
        system,
        options: options ?? null,
        diagnostics: analyserDiagnostic,
        checker: program.getTypeChecker(),
    };

    return {
        result: new ModuleNode(sourceFile, context),
        errors: analyserDiagnostic.getAll(),
    };
}
