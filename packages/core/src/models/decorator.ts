import type { SourceReference } from './reference.js';


export interface Decorator {
    name: string;
    arguments?: unknown[];
    source?: SourceReference;
}
