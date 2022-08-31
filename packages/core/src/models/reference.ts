import { DeclarationKind } from './declaration.js';


export interface Reference {
    name: string;
    kind?: DeclarationKind;
    href?: SourceReference;
}

export interface SourceReference {
    path?: string;
}
