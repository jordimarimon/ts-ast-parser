export interface LinkInstruction {
    path: string;
    kind: LinkInstructionType;
    declarationName: string;
}

export enum LinkInstructionType {
    // Resolves the initializer value of a variable or class field that
    // has been set with another variable
    resolveInitializerAsIdentifier,

    // Resolves the initializer value of a class field that
    // has been set with another class field
    resolveInitializerAsPropertyAccess,

    // Resolves the location of a Type-Alias/Interface/Superclass
    resolveSource,
}
