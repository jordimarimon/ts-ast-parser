export enum ExportKind {
    Default = 'Default',
    Namespace = 'Namespace',
    Star = 'Star',
    Named = 'Named',
    Equals = 'Equals',
}

export interface Export {
    name: string;
    kind: ExportKind;
    originalName?: string; // the original name used when using the `as` keyword
    typeOnly?: boolean;
    module?: string; // If we're reexporting from another module
}
