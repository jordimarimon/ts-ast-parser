/**
 * Defines the types of imports we may find
 */
export enum ImportType {
    default = 'default',
    named = 'named',
    namespace = 'namespace',
    aliased = 'aliased',
    string = 'string',
    externalModule = 'externalModule',
}

/**
 * Simplified definition of a module import
 */
export interface Import {
    /**
     * The name used as identifier inside the file to reference
     * the imported module.
     *
     * For example:
     *
     *      import { nameA } from 'moduleA'; --> name is "nameA"
     *      import nameA from 'moduleA'; --> name is "nameA"
     *      import * as nameA from 'moduleA'; --> name is "nameA"
     */
    name: string;

    /**
     * The type of import
     */
    kind: ImportType;

    /**
     * The path used in the import.
     *
     * Maybe a relative or absolute path or a bare module specifier.
     */
    importPath: string;

    /**
     * Whether the import path represents a bare module specifier
     */
    isBareModuleSpecifier: boolean;

    /**
     * Whether it import only the type:
     *
     *      import type { nameA } from 'moduleA';
     */
    isTypeOnly: boolean;
}
