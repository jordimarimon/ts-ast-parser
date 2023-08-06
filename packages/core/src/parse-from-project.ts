import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import { AnalyserDiagnostic } from './utils/errors.js';
import { ProjectNode } from './nodes/project-node.js';
import type { AnalyserContext } from './context.js';
import ts from 'typescript';


export async function parseFromProject(options: Partial<AnalyserOptions> = {}): Promise<ProjectNode | null> {
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
    analyserDiagnostic.set(program.getSemanticDiagnostics());

    if (!options.skipDiagnostics && !analyserDiagnostic.isEmpty()) {
        return null;
    }

    const sourceFiles = program.getSourceFiles();
    const context: AnalyserContext = {
        program,
        system,
        checker: program.getTypeChecker(),
        options: options ?? null,
        diagnostic: analyserDiagnostic,
    };

    return new ProjectNode(sourceFiles, context);
}
