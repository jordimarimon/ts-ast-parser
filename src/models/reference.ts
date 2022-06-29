/**
 * A reference to an export of a module.
 *
 * All references are required to be publicly accessible, so the canonical
 * representation of a reference is the export it's available from.
 *
 * `package` should generally refer to an npm package name. If `package` is
 * undefined then the reference is local to this package. If `module` is
 * undefined the reference is local to the containing module.
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
 * A reference that is associated with a type string and optionally a range
 * within the string.
 *
 * Start and end must both be present or not present. If they're present, they
 * are indices into the associated type string. If they are missing, the entire
 * type string is the symbol referenced and the name should match the type
 * string.
 */
export interface TypeReference extends Reference {
    start?: number;
    end?: number;
}

/**
 * A reference to the source of a declaration or member.
 */
export interface SourceReference {
    /**
     * An absolute URL to the source (ie. a GitHub URL).
     */
    href: string;
}
