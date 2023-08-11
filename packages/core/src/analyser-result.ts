import type { DiagnosticError } from './analyser-diagnostic.js';


export interface AnalyserResult<T> {
    result: T | null;
    errors: DiagnosticError[];
}
