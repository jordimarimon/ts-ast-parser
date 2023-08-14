import { AnalyserDiagnostic, DiagnosticErrorType } from './analyser-diagnostic.js';
import { AnalyserContext, isBrowser } from './analyser-context.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import type { AnalyserResult } from './analyser-result.js';
import { ModuleNode } from './nodes/module-node.js';
import ts from 'typescript';


/**
 * Given an array of TypeScript file paths and some configurable options,
 * reflects a simplified version of the TypeScript Abstract Syntax Tree.
 *
 * @param files - An array of paths where the TypeScripts files are located
 * @param options - Options to configure the analyzer
 *
 * @returns The reflected TypeScript AST
 */
export async function parseFromFiles(
    files: readonly string[],
    options: Partial<AnalyserOptions> = {},
): Promise<AnalyserResult<ModuleNode[]>> {
    if (!Array.isArray(files)) {
        return {
            result: [],
            errors: [{ kind: DiagnosticErrorType.ARGUMENT, messageText: 'Expected an array of files.' }],
        };
    }

    if (!options.system && isBrowser) {
        return {
            result: [],
            errors: [{
                kind: DiagnosticErrorType.ARGUMENT,
                messageText: 'You need to supply the AnalyserSystem when working inside the browser.',
            }],
        };
    }

    let system: AnalyserSystem;
    if (options.system) {
        system = options.system;
    } else {
        system = await import('./node-system.js').then(m => new m.NodeSystem({ analyserOptions: options }));
    }

    const commandLine = system.getCommandLine();
    const program = ts.createProgram({
        rootNames: files,
        options: commandLine.options,
        host: system.getCompilerHost(),
    });

    const diagnostics = new AnalyserDiagnostic();
    diagnostics.addMany(program.getSemanticDiagnostics());

    if (!options.skipDiagnostics && !diagnostics.isEmpty()) {
        return { result: null, errors: diagnostics.getAll() };
    }

    commandLine.errors.forEach(err => diagnostics.add(DiagnosticErrorType.COMMAND_LINE, err.messageText));
    if (commandLine.errors.length > 0) {
        return { result: null, errors: diagnostics.getAll() };
    }

    const context = new AnalyserContext(system, program, diagnostics, options);
    const modules: ModuleNode[] = [];

    for (const file of files) {
        const sourceFile = program.getSourceFile(file);

        if (!sourceFile) {
            diagnostics.add(DiagnosticErrorType.COMMAND_LINE, `Unable to analyse file ${file}`);
            continue;
        }

        modules.push(new ModuleNode(sourceFile, context));
    }

    return { result: modules, errors: diagnostics.getAll() };
}
