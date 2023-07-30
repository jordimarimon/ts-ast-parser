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
    const fileNames = (commandLine?.fileNames ?? []).map(p => path.relative(process.cwd(), p));
    const program = ts.createProgram(fileNames, compilerOptions, compilerHost);
    const diagnostics = program.getSemanticDiagnostics();

    if (diagnostics.length) {
        logError('Error while analysing source files:', formatDiagnostics(diagnostics));
        return null;
    }

    // FIXME(Jordi M.): Why we're receiving as source files, files located inside `node_modules`?
    const sourceFiles = program.getSourceFiles().filter(f => {
        return !program.isSourceFileDefaultLibrary(f) && !program.isSourceFileFromExternalLibrary(f) &&
            !f.fileName.match(/node_modules/)?.length;
    });

    const context: AnalyserContext = {
        program,
        checker: program.getTypeChecker(),
        options: options ?? null,
        commandLine,
        normalizePath: filePath => filePath ? path.normalize(path.relative(process.cwd(), filePath)) : '',
    };

    return new ProjectNode(sourceFiles, context);
}
