import type { AnalyserError } from './analyser-diagnostic.js';
import type { ProjectNode } from './nodes/project-node.js';


export interface AnalyserResult {
    project: ProjectNode | null;
    errors: AnalyserError[];
    formattedDiagnostics?: string;
}
