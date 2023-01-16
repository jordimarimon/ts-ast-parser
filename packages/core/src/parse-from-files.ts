import { getResolvedCompilerOptions } from './resolve-compiler-options.js';
import { formatDiagnostics, logError, logWarning } from './utils/logs.js';
import { ModuleNode } from './nodes/module-node.js';
import { Context } from './context.js';
import * as path from 'path';
import ts from 'typescript';


/**
 * Given am array of TypeScript file paths and some configurable options,
 * reflects a simplified version of the TypeScript Abstract Syntax Tree.
 *
 * @param files - An array of paths where the TypeScripts files are located
 * @param compilerOptions - Options to pass to the TypeScript compiler
 *
 * @returns The reflected TypeScript AST
 */
export function parseFromFiles(files: readonly string[], compilerOptions?: ts.CompilerOptions): ModuleNode[] {
    const modules: ModuleNode[] = [];
    const resolvedCompilerOptions = getResolvedCompilerOptions(compilerOptions);
    const program = ts.createProgram(files, resolvedCompilerOptions);
    const diagnostics = program.getSemanticDiagnostics();

    if (diagnostics.length) {
        logError('Error while analysing source files:', formatDiagnostics(diagnostics));
        return [];
    }

    Context.checker = program.getTypeChecker();
    Context.compilerOptions = resolvedCompilerOptions;
    Context.normalizePath = filePath => filePath ? path.normalize(path.relative(process.cwd(), filePath)) : '';

    for (const file of files) {
        const sourceFile = program.getSourceFile(file);

        if (!sourceFile) {
            logWarning(`Unable to analyze file "${file}".`);
            continue;
        }

        modules.push(new ModuleNode(sourceFile));
    }

    return modules;
}
