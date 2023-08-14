import { AnalyserDiagnostic, DiagnosticErrorType } from './analyser-diagnostic.js';
import { AnalyserContext, isBrowser } from './analyser-context.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import type { AnalyserResult } from './analyser-result.js';
import { ProjectNode } from './nodes/project-node.js';
import ts from 'typescript';


export async function parseFromProject(options: Partial<AnalyserOptions> = {}): Promise<AnalyserResult<ProjectNode>> {
    if (!options.system && isBrowser) {
        return {
            result: null,
            errors: [{
                kind: DiagnosticErrorType.ARGUMENT,
                messageText: 'You need to supply the AnalyserSystem when working inside the browser.',
            }],
        };
    }

    let system: AnalyserSystem;
    if (options.system) {
        system = options.system;
    } else {
        system = await import('./node-system.js').then(m => new m.NodeSystem({ analyserOptions: options }));
    }

    const commandLine = system.getCommandLine();
    const program = ts.createProgram({
        rootNames: commandLine.fileNames,
        options: commandLine.options,
        host: system.getCompilerHost(),
    });

    const diagnostics = new AnalyserDiagnostic();
    diagnostics.addMany(program.getSemanticDiagnostics());

    if (!options.skipDiagnostics && !diagnostics.isEmpty()) {
        return { result: null, errors: diagnostics.getAll() };
    }

    commandLine.errors.forEach(err => diagnostics.add(DiagnosticErrorType.COMMAND_LINE, err.messageText));
    if (commandLine.errors.length > 0) {
        return { result: null, errors: diagnostics.getAll() };
    }

    const sourceFiles: ts.SourceFile[] = [];
    for (const f of program.getRootFileNames()) {
        const sourceFile = program.getSourceFile(f);

        if (!sourceFile) {
            diagnostics.add(DiagnosticErrorType.COMMAND_LINE, `Unable to analyse file ${f}`);
            continue;
        }

        sourceFiles.push(sourceFile);
    }

    const context = new AnalyserContext(system, program, diagnostics, options);
    const project = new ProjectNode(sourceFiles, context);

    return { result: project, errors: diagnostics.getAll() };
}
