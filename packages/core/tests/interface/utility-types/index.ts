interface Props {
    a?: number;
    b?: string;
}

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


