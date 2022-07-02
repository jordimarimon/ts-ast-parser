export enum ImportType {
    default,
    named,
    aggregate,
}

export interface Import {
    name: string;
    kind: ImportType;
    importPath: string;
    isBareModuleSpecifier: boolean;
    isTypeOnly: boolean;
}
