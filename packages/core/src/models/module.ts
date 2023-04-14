import type { Declaration } from './declaration.js';
import type { Export } from './export.js';
import type { Import } from './import.js';


export interface Module {
    path: string;
    declarations: Declaration[];
    imports: Import[];
    exports: Export[];
}
