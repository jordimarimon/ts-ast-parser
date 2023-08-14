import { AnalyserContext, isBrowser } from './analyser-context.js';
import { AnalyserDiagnostic } from './analyser-diagnostic.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import type { AnalyserResult } from './analyser-result.js';
import { ModuleNode } from './nodes/module-node.js';
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
    const fileName = '/unknown.ts';

    if (!source) {
        return {
            result: null,
            errors: [{messageText: 'Source code is empty.'}],
        };
    }

    let system: AnalyserSystem;
    if (options.system) {
        system = options.system;
        system.writeFile(fileName, source);
    } else if (isBrowser) {
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

    const diagnostics = new AnalyserDiagnostic(system.getCurrentDirectory());
    const commandLine = system.getCommandLine();
    const compilerHost = system.getCompilerHost();
    const program = ts.createProgram({
        rootNames: commandLine.fileNames,
        options: commandLine.options,
        host: compilerHost,
    });

    const sourceFile = program.getSourceFile(fileName);

    const commandLineErrors = ts.getConfigFileParsingDiagnostics(commandLine);
    diagnostics.addManyDiagnostics(commandLineErrors);
    if (commandLine.errors.length > 0) {
        return {
            result: null,
            errors: diagnostics.getAll(),
            formattedDiagnostics: diagnostics.formatDiagnostics(),
        };
    }

    diagnostics.addManyDiagnostics(program.getSemanticDiagnostics());
    diagnostics.addManyDiagnostics(program.getSyntacticDiagnostics());
    if (!options.skipDiagnostics && !diagnostics.isEmpty()) {
        return {
            result: null,
            errors: diagnostics.getAll(),
            formattedDiagnostics: diagnostics.formatDiagnostics(),
        };
    }

    if (!sourceFile) {
        diagnostics.addArgumentError('Unable to analyse source code.');
        return { result: null, errors: diagnostics.getAll() };
    }

    const context = new AnalyserContext(system, program, diagnostics, options);
    const module = new ModuleNode(sourceFile, context);

    return {
        result: module,
        errors: diagnostics.getAll(),
        formattedDiagnostics: diagnostics.formatDiagnostics(),
    };
}
