import { AnalyserDiagnostic, DiagnosticErrorType } from './analyser-diagnostic.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import type { AnalyserResult } from './analyser-result.js';
import { ProjectNode } from './nodes/project-node.js';
import type { AnalyserContext } from './context.js';
import ts from 'typescript';


export async function parseFromProject(options: Partial<AnalyserOptions> = {}): Promise<AnalyserResult<ProjectNode>> {
    let system: AnalyserSystem;
    if (options.system) {
        system = options.system;
    } else {
        system = await import('./node-system.js').then(m => new m.NodeSystem({analyserOptions: options}));
    }

    const commandLine = system.getCommandLine();
    const program = ts.createProgram({
        rootNames: commandLine.fileNames,
        options: commandLine.options,
        host: system.getCompilerHost(),
    });

    const analyserDiagnostic = new AnalyserDiagnostic();
    analyserDiagnostic.addMany(program.getSemanticDiagnostics());

    if (!options.skipDiagnostics && !analyserDiagnostic.isEmpty()) {
        return {result: null, errors: analyserDiagnostic.getAll()};
    }

    commandLine.errors.forEach(err => {
        analyserDiagnostic.add(DiagnosticErrorType.COMMAND_LINE, err.messageText);
    });
    if (commandLine.errors.length > 0) {
        return {result: null, errors: analyserDiagnostic.getAll()};
    }

    const sourceFiles: ts.SourceFile[] = [];
    for (const f of program.getRootFileNames()) {
        const sourceFile = program.getSourceFile(f);
        if (!sourceFile) {
            analyserDiagnostic.add(DiagnosticErrorType.COMMAND_LINE, `Unable to analyse file ${f}`);
            continue;
        }
        sourceFiles.push(sourceFile);
    }

    const context: AnalyserContext = {
        program,
        system,
        checker: program.getTypeChecker(),
        options: options ?? null,
        diagnostics: analyserDiagnostic,
    };

    return {
        result: new ProjectNode(sourceFiles, context),
        errors: analyserDiagnostic.getAll(),
    };
}
