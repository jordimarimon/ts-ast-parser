import { Declaration } from 'typescript';
import { Export } from './export';
import { Import } from './import';


/**
 * The metadata of a module
 */
export interface Module {
    /**
     * Path of the TypeScript file analysed
     */
    path: string;

    /**
     * The declarations of a module.
     *
     * For documentation purposes, all declarations that are reachable from
     * exports should be described here.
     */
    declarations: Declaration[];

    /**
     * The imports of a module
     */
    imports: Import[];

    /**
     * The exports of a module.
     */
    exports: Export[];
}
