import { Declaration } from './declaration';
import { Export } from './export';
import { Import } from './import';


/**
 * Defines the metadata of a module
 */
export interface Module {
    /**
     * Path of the TypeScript file
     */
    path: string;

    /**
     * All declarations that are reachable from
     * export defined inside this module.
     */
    declarations: Declaration[];

    /**
     * All the modules that have been imported
     */
    imports: Import[];

    /**
     * Exported modules
     */
    exports: Export[];
}
