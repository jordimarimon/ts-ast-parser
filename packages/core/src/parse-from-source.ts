import type { AnalyserSystem } from './system/analyser-system.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserResult } from './analyser-result.js';
import { Project } from './project.js';


/**
 * Reflects a simplified version of the TypeScript Abstract
 * Syntax Tree from a TypeScript code snippet
 *
 * @param source - A string that represents the TypeScript source code
 * @param options - Options to configure the analyzer
 *
 * @returns The reflected TypeScript AST
 */
export async function parseFromSource(
    source: string,
    options: Partial<AnalyserOptions> = {},
): Promise<AnalyserResult> {
    if (!source) {
        return {
            project: null,
            errors: [{messageText: 'Source code is empty.'}],
        };
    }

    let system: AnalyserSystem;
    if (options.system) {
        system = options.system;
    } else {
        const m = await import('./system/in-memory-system.js');
        system = await m.InMemorySystem.create();
    }

    const project = Project.fromSource(system, source, options);
    const diagnostics = project.getDiagnostics();

    return {
        project,
        errors: diagnostics.getAll(),
        formattedDiagnostics: diagnostics.formatDiagnostics(),
    };
}
