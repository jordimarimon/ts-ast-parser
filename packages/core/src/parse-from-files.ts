import { AnalyserDiagnostic, DiagnosticErrorType } from './analyser-diagnostic.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import type { AnalyserResult } from './analyser-result.js';
import type { AnalyserContext } from './context.js';
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

    const context: AnalyserContext = {
        program,
        system,
        checker: program.getTypeChecker(),
        options: options ?? null,
        diagnostics: analyserDiagnostic,
    };

    const modules: ModuleNode[] = [];
    for (const file of files) {
        const sourceFile = program.getSourceFile(file);

        if (!sourceFile) {
            analyserDiagnostic.add(DiagnosticErrorType.COMMAND_LINE, `Unable to analyse file ${file}`);
            continue;
        }

        modules.push(new ModuleNode(sourceFile, context));
    }

    return { result: modules, errors: analyserDiagnostic.getAll() };
}
