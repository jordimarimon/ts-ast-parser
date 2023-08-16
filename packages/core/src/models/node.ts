/**
 * The kind of top level reflected nodes in a module
 */
export enum RootNodeType {
    /**
     * Import declarations
     */
    Import = 'Import',

    /**
     * Class, Interface, Function, Type Alias, Enum declarations
     */
    Declaration = 'Declaration',

    /**
     * Export declarations
     */
    Export = 'Export',
}
