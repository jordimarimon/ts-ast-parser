import type { AnalyserError } from './analyser-diagnostic.js';


export interface AnalyserResult<T> {
    result: T | null;
    errors: AnalyserError[];
    formattedDiagnostics?: string;
}
