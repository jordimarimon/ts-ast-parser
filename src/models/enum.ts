import { Decorator } from './decorator';


export interface EnumDeclaration {
    kind: 'enum';
    name: string;
    members: EnumMember[];
    decorators: Decorator[];
}

export interface EnumMember {
    name: string;
    value: string | number;
}
