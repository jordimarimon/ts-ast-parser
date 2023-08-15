import { AnalyserContext, isBrowser } from './analyser-context.js';
import { AnalyserDiagnostic } from './analyser-diagnostic.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import type { AnalyserResult } from './analyser-result.js';
import { ProjectNode } from './nodes/project-node.js';
import ts from 'typescript';


export async function parseFromProject(options: Partial<AnalyserOptions> = {}): Promise<AnalyserResult> {
    if (!options.system && isBrowser) {
        return {
            project: null,
            errors: [{
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

    const diagnostics = new AnalyserDiagnostic(system.getCurrentDirectory());
    const commandLine = system.getCommandLine();
    const program = ts.createProgram({
        rootNames: commandLine.fileNames,
        options: commandLine.options,
        host: system.getCompilerHost(),
    });

    const commandLineErrors = ts.getConfigFileParsingDiagnostics(commandLine);
    diagnostics.addManyDiagnostics(commandLineErrors);
    if (commandLine.errors.length > 0) {
        return {
            project: null,
            errors: diagnostics.getAll(),
            formattedDiagnostics: diagnostics.formatDiagnostics(),
        };
    }

    diagnostics.addManyDiagnostics(program.getSemanticDiagnostics());
    diagnostics.addManyDiagnostics(program.getSyntacticDiagnostics());
    if (!options.skipDiagnostics && !diagnostics.isEmpty()) {
        return {
            project: null,
            errors: diagnostics.getAll(),
            formattedDiagnostics: diagnostics.formatDiagnostics(),
        };
    }

    const sourceFiles: ts.SourceFile[] = [];
    for (const f of program.getRootFileNames()) {
        const sourceFile = program.getSourceFile(f);

        if (!sourceFile) {
            diagnostics.addArgumentError(`Unable to analyse file ${f}`);
            continue;
        }

        sourceFiles.push(sourceFile);
    }

    const context = new AnalyserContext(system, program, diagnostics, options);
    const project = new ProjectNode(sourceFiles, context);

    return {
        project,
        errors: diagnostics.getAll(),
        formattedDiagnostics: diagnostics.formatDiagnostics(),
    };
}
