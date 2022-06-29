import { Reference } from './reference';


export interface Export {
    /**
     * The name of the exported symbol.
     *
     * JavaScript has a number of ways to export objects which determine the
     * correct name to use.
     *
     * - Default exports must use the name "default".
     * - Named exports use the name that is exported. If the export is renamed
     *   with the "as" clause, use the exported name.
     * - Aggregating exports (`* from`) should use the name `*`
     */
    name: string;

    /**
     * A reference to the exported declaration.
     *
     * In the case of aggregating exports, the reference's `module` field must be
     * defined and the `name` field must be `"*"`.
     */
    declaration: Reference;

    /**
     * Whether the export is deprecated. For example, the name of the export was changed.
     * If the value is a string, it's the reason for the deprecation.
     */
    deprecated?: boolean | string;
}
