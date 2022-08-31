import { SourceReference } from './reference.js';


export interface Decorator {
    name: string;
    parameters?: unknown[];
    href?: SourceReference;
}
