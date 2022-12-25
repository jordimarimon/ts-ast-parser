import { SourceReference } from './reference.js';


// Represents where a type has been defined
export type TypeReference = {text: string} & SourceReference;

export interface Type {
    text: string;
    // Types can be the composition of multiple types (UnionTypes, IntersectionTypes, etc...).
    // Here we save where each individual type, that is made of, has been defined.
    sources?: TypeReference[];
}
