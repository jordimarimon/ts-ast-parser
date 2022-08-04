export enum ExportType {
    all = 'all',
    default = 'default',
    namespace = 'namespace',
    named = 'named',
    equals = 'equals',
}

export interface Export {
    name: string;
    referenceName?: string; // the original name used when using the `as` keyword
    type: ExportType;
    isTypeOnly: boolean;
}
