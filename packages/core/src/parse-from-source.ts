import { formatDiagnostics, logError, logWarning } from './utils/logs.js';
import { DEFAULT_COMPILER_OPTIONS } from './default-compiler-options.js';
import { createCompilerHost } from './compiler-host.js';
import { ModuleNode } from './nodes/module-node.js';
import type { AnalyzerContext } from './context.js';
import ts from 'typescript';


/**
 * Reflects a simplified version of the TypeScript Abstract
 * Syntax Tree from a TypeScript code snippet
 *
 * @param source - A string that represents the TypeScript source code
 * @param compilerOptions - Options to pass to the TypeScript compiler. For more information see [Compiler Options](https://www.typescriptlang.org/tsconfig#compilerOptions).
 *
 * @returns The reflected TypeScript AST
 */
export function parseFromSource(source: string, compilerOptions?: ts.CompilerOptions): ModuleNode | null {
    const fileName = 'unknown.ts';
    const compilerHost = createCompilerHost(fileName, source);
    const resolvedCompilerOptions = compilerOptions ?? DEFAULT_COMPILER_OPTIONS;
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
        compilerOptions: resolvedCompilerOptions,
        normalizePath: path => path ?? '',
    };

    return new ModuleNode(sourceFile, context);
}
