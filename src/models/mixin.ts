import { FunctionLike } from './function';
import { ClassLike } from './class';


export interface MixinDeclaration extends ClassLike, FunctionLike {
    kind: 'mixin';
}
