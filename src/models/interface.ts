import { ClassLike } from './class';


export interface InterfaceDeclaration extends ClassLike {
    kind: 'interface';
}
