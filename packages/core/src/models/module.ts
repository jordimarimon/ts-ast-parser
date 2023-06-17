import type { Declaration } from './declaration.js';
import type { Export } from './export.js';
import type { Import } from './import.js';


/**
 * A JS Module represents all the declarations/imports/exports defined inside a file
 */
export interface Module {
    /**
     * The path of the file relative to the working directory
     */
    path: string;

    /**
     * All the declarations exported from the file
     */
    declarations: Declaration[];

    /**
     * All the imports
     */
    imports: Import[];

    /**
     * All the exports
     */
    exports: Export[];
}
