/**
 * The type of import
 */
export enum ImportKind {
    Default = 'Default',
    Named = 'Named',
    Namespace = 'Namespace',
    SideEffect = 'SideEffect',
    Dynamic = 'Dynamic',
}

/**
 * An import declaration after being serialized
 */
export interface Import {
    /**
     * The name of the symbol being imported.
     */
    name?: string;

    /**
     * The type of import
     */
    kind: ImportKind;

    /**
     * The path of the import
     */
    importPath: string;

    /**
     * If the import has been renamed using the `as` keyword, this will be
     * the original name of the symbol before being renamed.
     */
    referenceName?: string;

    /**
     * Whether the import is a bare module specifier
     */
    bareModuleSpecifier?: boolean;

    /**
     * Whether the import is type only
     */
    typeOnly?: boolean;

    /**
     * If the path of the import has been re-map through the `paths`
     * property in the `tsconfig.json`, this will be the original path
     * of the file.
     */
    originalPath?: string;
}
