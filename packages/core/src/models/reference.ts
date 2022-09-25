import { DeclarationKind } from './declaration-kind.js';


export interface Reference {
    name: string;
    kind?: DeclarationKind;
    source?: SourceReference;
}

export interface SourceReference {
    path?: string;
}
