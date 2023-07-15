import { JS_DEFAULT_COMPILER_OPTIONS, TS_DEFAULT_COMPILER_OPTIONS } from './default-compiler-options.js';
import { formatDiagnostics, logError, logWarning } from './utils/logs.js';
import type { AnalyzerOptions } from './analyzer-options.js';
import { createCompilerHost } from './compiler-host.js';
import { ModuleNode } from './nodes/module-node.js';
import type { AnalyzerContext } from './context.js';
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
export function parseFromSource(source: string, options?: Partial<AnalyzerOptions>): ModuleNode | null {
    const fileName = 'unknown.ts';
    const compilerHost = createCompilerHost(fileName, source);
    const resolvedCompilerOptions = options?.jsProject
        ? JS_DEFAULT_COMPILER_OPTIONS
        : (options?.compilerOptions ?? TS_DEFAULT_COMPILER_OPTIONS);
    const program = ts.createProgram([fileName], resolvedCompilerOptions, compilerHost);
    const sourceFile = program.getSourceFile(fileName);
    const diagnostics = program.getSemanticDiagnostics();

    if (diagnostics.length) {
        logError('Error analysing source code:', formatDiagnostics(diagnostics));
        return null;
    }

    if (!sourceFile) {
        logWarning('Unable to analyze source code.');
        return null;
    }

    const context: AnalyzerContext = {
        checker: program.getTypeChecker(),
        options: options ?? null,
        commandLine: null,
        normalizePath: path => path ?? '',
    };

    return new ModuleNode(sourceFile, context);
}
