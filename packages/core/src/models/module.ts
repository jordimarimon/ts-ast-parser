import { Declaration } from './declaration.js';
import { Export } from './export.js';
import { Import } from './import.js';


export interface Module {
    path: string;
    declarations: Declaration[];
    imports: Import[];
    exports: Export[];
}
