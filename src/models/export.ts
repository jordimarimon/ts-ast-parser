export enum ExportType {
    all = 'all',
    default = 'default',
    namespace = 'namespace',
    named = 'named',
    equals = 'equals',
}


export interface Export {
    /**
     * The name of the exported symbol.
     *
     * JavaScript has a number of ways to export objects which determine the
     * correct name to use.
     *
     * - Default export must use the name "default".
     *
     * - Named export use the name that is exported. If the export is renamed
     *   with the "as" clause, use the exported name.
     *
     * - Aggregating export (`* from`) should use the name `*`
     */
    name: string;

    /**
     * If the export uses the `as` keyword, this is the name
     * of the declaration that is being renamed
     */
    referenceName?: string;

    /**
     * The type of export
     */
    type: ExportType;

    /**
     * Whether the exported declaration is only the type
     */
    isTypeOnly: boolean;
}
