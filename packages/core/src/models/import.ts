export enum ImportType {
    default = 'default',
    named = 'named',
    namespace = 'namespace',
    aliased = 'aliased',
    string = 'string',
    externalModule = 'externalModule',
}

export interface Import {
    name: string;
    kind: ImportType;
    importPath: string;
    isBareModuleSpecifier?: boolean;
    isTypeOnly?: boolean;
}
