import { Decorator } from './decorator';
import { JSDoc } from './js-doc';


export interface EnumDeclaration {
    kind: 'enum';
    name: string;
    members: EnumMember[];
    decorators: Decorator[];
    jsDoc: JSDoc;
}

export interface EnumMember {
    name: string;
    value: string | number;
}
