export enum ImportKind {
    default = 'default',
    named = 'named',
    namespace = 'namespace',
}

export interface Import {
    name: string;
    kind: ImportKind;
    importPath: string;
    isBareModuleSpecifier?: boolean;
    isTypeOnly?: boolean;
    originalPath?: string;
}
