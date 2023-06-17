/**
 * The type of export
 */
export enum ExportKind {
    Default = 'Default',
    Namespace = 'Namespace',
    Star = 'Star',
    Named = 'Named',
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
