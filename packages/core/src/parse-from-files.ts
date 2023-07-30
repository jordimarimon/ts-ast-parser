import { getResolvedCompilerOptions } from './resolve-compiler-options.js';
import { formatDiagnostics, logError, logWarning } from './utils/logs.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserContext } from './context.js';
import { ModuleNode } from './nodes/module-node.js';
import * as path from 'path';
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
export function parseFromFiles(files: readonly string[], options: Partial<AnalyserOptions> = {}): ModuleNode[] {
    if (!Array.isArray(files)) {
        logError('Expected an array of files.');
        return [];
    }

    const modules: ModuleNode[] = [];
    const resolvedCompilerOptions = getResolvedCompilerOptions({...options, include: files});
    const compilerHost = ts.createCompilerHost(resolvedCompilerOptions.compilerOptions, true);
    const program = ts.createProgram(files, resolvedCompilerOptions.compilerOptions, compilerHost);
    const diagnostics = program.getSemanticDiagnostics();

    if (diagnostics.length) {
        logError('Error while analysing source files:', formatDiagnostics(diagnostics));
        return [];
    }

    const context: AnalyserContext = {
        program,
        checker: program.getTypeChecker(),
        options: options ?? null,
        commandLine: resolvedCompilerOptions.commandLine,
        normalizePath: filePath => filePath ? path.normalize(path.relative(process.cwd(), filePath)) : '',
    };

    for (const file of files) {
        const sourceFile = program.getSourceFile(file);

        if (!sourceFile) {
            logWarning(`Unable to analyze file "${file}".`);
            continue;
        }

        modules.push(new ModuleNode(sourceFile, context));
    }

    return modules;
}
