export enum ImportKind {
    Default = 'Default',
    Named = 'Named',
    Namespace = 'Namespace',
    SideEffect = 'SideEffect',
}

export interface Import {
    name?: string;
    kind: ImportKind;
    importPath: string;
    referenceName?: string; // the original name used when using the `as` keyword
    isBareModuleSpecifier?: boolean;
    isTypeOnly?: boolean;
    originalPath?: string;
}
