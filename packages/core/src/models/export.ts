/**
 * The kind of export
 */
export enum ExportKind {
    /**
     * Case of `export default foo`
     */
    Default = 'Default',

    /**
     * Case of `export * as foo from './foo.js'`
     */
    Namespace = 'Namespace',

    /**
     * Case of `export * from './foo.js'`
     */
    Star = 'Star',

    /**
     * Case of `export const foo = 4` or `export { a, b } from './foo.js'`
     */
    Named = 'Named',

    /**
     * Case of `export = Foo`
     */
    Equals = 'Equals',
}

/**
 * Result of an export after serializing it
 */
export interface Export {
    /**
     * The name of the symbol getting exported.
     *
     * If it's a star export, it will be a "*".
     */
    name: string;

    /**
     * The type of export
     */
    kind: ExportKind;

    /**
     * In case the export symbol has been renamed, this is the original symbol
     * name before being renamed (using the `as` keyword).
     */
    originalName?: string;

    /**
     * Whether the export is type only
     */
    typeOnly?: boolean;

    /**
     * If the export is reexporting another module, this will be the path
     * of the re-exported module.
     *
     * Example:
     *
     *      export * from './my-module.js';
     */
    module?: string;
}
