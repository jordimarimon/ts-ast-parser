import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import { AnalyserDiagnostic } from './utils/errors.js';
import { ModuleNode } from './nodes/module-node.js';
import type { AnalyserContext } from './context.js';
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
): Promise<ModuleNode | null> {
    const fileName = 'unknown.ts';

    let system: AnalyserSystem;
    if (options.system) {
        system = options.system;
    } else {
        system = await import('./node-system.js').then(m => {
            return new m.NodeSystem({vfs: true, analyserOptions: {...options, include: [fileName]}});
        });
    }
    system.writeFile(fileName, source);

    const commandLine = system.getCommandLine();
    const compilerHost = system.getCompilerHost();
    const program = ts.createProgram({
        rootNames: [fileName],
        options: commandLine.options,
        host: compilerHost,
    });
    const sourceFile = program.getSourceFile(fileName);

    const analyserDiagnostic = new AnalyserDiagnostic();
    analyserDiagnostic.set(program.getSemanticDiagnostics());

    if (!options.skipDiagnostics && !analyserDiagnostic.isEmpty()) {
        return null;
    }

    if (!sourceFile) {
        return null;
    }

    const context: AnalyserContext = {
        program,
        system,
        options: options ?? null,
        diagnostic: analyserDiagnostic,
        checker: program.getTypeChecker(),
    };

    return new ModuleNode(sourceFile, context);
}
