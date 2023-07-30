import { JS_DEFAULT_COMPILER_OPTIONS, TS_DEFAULT_COMPILER_OPTIONS } from './default-compiler-options.js';
import { formatDiagnostics, logError, logWarning } from './utils/logs.js';
import { createBrowserCompilerHost } from './browser-compiler-host.js';
import type { AnalyserOptions } from './analyser-options.js';
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
export async function parseFromSource(source: string, options: Partial<AnalyserOptions> = {}): Promise<ModuleNode | null> {
    const fileName = 'unknown.ts';

    const compilerOptions = options?.jsProject
        ? JS_DEFAULT_COMPILER_OPTIONS
        : (options?.compilerOptions ?? TS_DEFAULT_COMPILER_OPTIONS);

    let virtualFileSystem: {compilerHost: ts.CompilerHost; fsMap: Map<string, string>};
    if (isBrowser) {
        virtualFileSystem = await createBrowserCompilerHost(fileName, source, compilerOptions);
    } else {
        // We use a dynamic import because the compiler host depends on NodeJS modules
        // that don't exist in a browser environment
        virtualFileSystem = await import('./node-compiler-host.js').then(m => {
            return m.createNodeCompilerHost(fileName, source, compilerOptions, ts);
        });
    }

    const program = ts.createProgram({
        rootNames: [...virtualFileSystem.fsMap.keys()],
        options: compilerOptions,
        host: virtualFileSystem.compilerHost,
    });
    const sourceFile = program.getSourceFile(fileName);
    const diagnostics = program.getSemanticDiagnostics();

    if (!options.skipDiagnostics && diagnostics.length) {
        logError('Error while analysing source code:', formatDiagnostics(diagnostics));
        return null;
    }

    if (!sourceFile) {
        logWarning('Unable to analyze source code.');
        return null;
    }

    const context: AnalyserContext = {
        program,
        checker: program.getTypeChecker(),
        options: options ?? null,
        commandLine: null,
        normalizePath: path => path ?? '',
    };

    return new ModuleNode(sourceFile, context);
}
