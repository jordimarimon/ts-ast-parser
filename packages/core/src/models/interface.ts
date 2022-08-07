import { ClassLike } from './class.js';


export interface InterfaceDeclaration extends ClassLike {
    kind: 'interface';
}
