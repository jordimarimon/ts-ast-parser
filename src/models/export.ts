import { Reference } from './reference';


export interface Export {
    /**
     * The name of the exported symbol.
     *
     * JavaScript has a number of ways to export objects which determine the
     * correct name to use.
     *
     * - Default export must use the name "default".
     * - Named export use the name that is exported. If the export is renamed
     *   with the "as" clause, use the exported name.
     * - Aggregating export (`* from`) should use the name `*`
     */
    name: string;

    /**
     * A reference to the exported declaration.
     */
    declaration: Reference;
}
