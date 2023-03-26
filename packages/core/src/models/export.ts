export enum ExportKind {
    default = 'default',
    namespace = 'namespace',
    star = 'star',
    named = 'named',
    equals = 'equals',
}

export interface Export {
    name: string;
    kind: ExportKind;
    originalName?: string; // the original name used when using the `as` keyword
    isTypeOnly?: boolean;
    module?: string; // If we're reexporting from another module
}
