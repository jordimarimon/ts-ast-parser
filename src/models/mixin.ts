import { FunctionLike } from './function';
import { ClassLike } from './class';

/**
 * A description of a class mixin.
 *
 * Mixins are functions which parse a new subclass of a given superclass.
 * This interfaces describes the class and custom element features that
 * are added by the mixin. As such, it extends the CustomElement interface and
 * ClassLike interface.
 *
 * Since mixins are functions, it also extends the FunctionLike interface. This
 * means a mixin is callable, and has parameters and a return type.
 *
 * The return type is often hard or impossible to accurately describe in type
 * systems like TypeScript. It requires generics and an `extends` operator
 * that TypeScript lacks. Therefore, it's recommended that the return type is
 * left empty. The most common form of a mixin function takes a single
 * argument, so consumers of this interface should assume that the return type
 * is the single argument subclassed by this declaration.
 *
 * A mixin should not have a superclass. If a mixins composes other mixins,
 * they should be listed in the `mixins` field.
 */
export interface MixinDeclaration extends ClassLike, FunctionLike {
    kind: 'mixin';
}
