import { getResolvedCompilerOptions } from './resolve-compiler-options.js';
import { formatDiagnostics, logError } from './utils/logs.js';
import type { AnalyserOptions } from './analyser-options.js';
import { ProjectNode } from './nodes/project-node.js';
import type { AnalyserContext } from './context.js';
import ts from 'typescript';
import path from 'path';


export function parseFromProject(options: Partial<AnalyserOptions> = {}): ProjectNode | null {
    const {compilerOptions, commandLine} = getResolvedCompilerOptions(options);
    const compilerHost = ts.createCompilerHost(compilerOptions, true);
    const program = ts.createProgram(commandLine?.fileNames ?? [], compilerOptions, compilerHost);
    const diagnostics = program.getSemanticDiagnostics();

    if (diagnostics.length) {
        logError('Error while analysing source files:', formatDiagnostics(diagnostics));
        return null;
    }

    const context: AnalyserContext = {
        checker: program.getTypeChecker(),
        options: options ?? null,
        commandLine,
        normalizePath: filePath => filePath ? path.normalize(path.relative(process.cwd(), filePath)) : '',
    };

    return new ProjectNode(program.getSourceFiles(), context);
}
