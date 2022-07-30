export enum ExportType {
    all = 'all',
    default = 'default',
    namespace = 'namespace',
    named = 'named',
    equals = 'equals',
}

export interface Export {
    name: string;
    referenceName?: string;
    type: ExportType;
    isTypeOnly: boolean;
}
