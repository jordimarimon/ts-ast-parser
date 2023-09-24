import type { AnalyserSystem } from './system/analyser-system.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserResult } from './analyser-result.js';
import { createSystem } from './system/create-system.js';
import { Project } from './project.js';


/**
 * Reflects a simplified version of the TypeScript Abstract
 * Syntax Tree from a project (a collection of TypeScript or JavaScript files)
 *
 * @param options - Options to configure the analyzer
 * @returns The reflected TypeScript AST
 */
export async function parseFromProject(options: Partial<AnalyserOptions> = {}): Promise<AnalyserResult> {
    let system: AnalyserSystem;
    if (options.system) {
        system = options.system;
    } else {
        system = await createSystem();
    }

    const project = Project.fromTSConfig(system, options);
    const diagnostics = project.getDiagnostics();

    return {
        project,
        errors: diagnostics.getAll(),
        formattedDiagnostics: diagnostics.formatDiagnostics(),
    };
}
