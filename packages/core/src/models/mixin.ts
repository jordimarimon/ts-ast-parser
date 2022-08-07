import { FunctionLike } from './function.js';
import { ClassLike } from './class.js';


export interface MixinDeclaration extends ClassLike, FunctionLike {
    kind: 'mixin';
}
