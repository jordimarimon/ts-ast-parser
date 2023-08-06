import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import { AnalyserDiagnostic } from './utils/errors.js';
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
): Promise<ModuleNode[]> {
    if (!Array.isArray(files)) {
        return [];
    }

    let system: AnalyserSystem;
    if (options.system) {
        system = options.system;
    } else {
        system = await import('./node-system.js').then(m => new m.NodeSystem({analyserOptions: options}));
    }

    const commandLine = system.getCommandLine();
    const program = ts.createProgram({
        rootNames: files,
        options: commandLine.options,
        host: system.getCompilerHost(),
    });

    const analyserDiagnostic = new AnalyserDiagnostic();
    analyserDiagnostic.set(program.getSemanticDiagnostics());

    if (!options.skipDiagnostics && !analyserDiagnostic.isEmpty()) {
        return [];
    }

    const context: AnalyserContext = {
        program,
        system,
        checker: program.getTypeChecker(),
        options: options ?? null,
        diagnostic: analyserDiagnostic,
    };

    const modules: ModuleNode[] = [];
    for (const file of files) {
        const sourceFile = program.getSourceFile(file);

        if (!sourceFile) {
            continue;
        }

        modules.push(new ModuleNode(sourceFile, context));
    }

    return modules;
}
