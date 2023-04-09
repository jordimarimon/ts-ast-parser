interface Props {
    a?: number;
    b?: string;
}

// Extends a TypeAliasDeclaration that has a MappedTypeNode
export interface RequiredProps extends Required<Props> {
    c: boolean;
}

interface Todo {
    title: string;
    description: string;
    completed: boolean;
}

export interface TodoPreview extends Pick<Todo, 'title' | 'completed'> {
    preview: string;
}
