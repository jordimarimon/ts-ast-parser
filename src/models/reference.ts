/**
 * A reference to an export of a module.
 *
 * All references are required to be publicly accessible, so the canonical
 * representation of a reference is the export it's available from.
 *
 * `package` should generally refer to package name used in the registry where one downloads it.
 *
 * If `package` is undefined, then the reference, is local to this package.
 *
 * If `module` is undefined, then the reference, is local to the containing module.
 *
 * References to global symbols like `Array`, `HTMLElement`, or `Event` should
 * use a `package` name of `"global:"`.
 */
export interface Reference {
    name: string;
    package?: string;
    module?: string;
}

/**
 * A reference to the source of a declaration
 */
export interface SourceReference {
    /**
     * An absolute URL to the source.
     */
    href: string;
}
