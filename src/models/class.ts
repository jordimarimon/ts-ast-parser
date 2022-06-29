import { Reference, SourceReference } from './reference';
import { PropertyLike } from './property';
import { FunctionLike } from './function';


export type Privacy = 'public' | 'private' | 'protected';

export type ClassMember = ClassField | ClassMethod;

export interface ClassField extends PropertyLike {
    kind: 'field';
    static?: boolean;
    privacy?: Privacy;
    inheritedFrom?: Reference;
    source?: SourceReference;
}

export interface ClassMethod extends FunctionLike {
    kind: 'method';
    static?: boolean;
    privacy?: Privacy;
    inheritedFrom?: Reference;
    source?: SourceReference;
}

/**
 * The common interface of classes and mixins.
 */
export interface ClassLike {
    name: string;

    /**
     * A markdown summary suitable for display in a listing.
     */
    summary?: string;

    /**
     * A markdown description of the class.
     */
    description?: string;

    /**
     * The superclass of this class.
     *
     * If this class is defined with mixin
     * applications, the prototype chain includes the mixin applications
     * and the true superclass is computed from them.
     */
    superclass?: Reference;

    /**
     * Any class mixins applied in the extends clause of this class.
     *
     * If mixins are applied in the class definition, then the true superclass
     * of this class is the result of applying mixins in order to the superclass.
     *
     * Mixins must be listed in order of their application to the superclass or
     * previous mixin application. This means that the innermost mixin is listed
     * first. This may read backwards from the common order in JavaScript, but
     * matches the order of language used to describe mixin application, like
     * "S with A, B".
     *
     * @example
     *
     * ```javascript
     * class T extends B(A(S)) {}
     * ```
     *
     * is described by:
     * ```json
     * {
     *   "kind": "class",
     *   "superclass": {
     *     "name": "S"
     *   },
     *   "mixins": [
     *     {
     *       "name": "A"
     *     },
     *     {
     *       "name": "B"
     *     },
     *   ]
     * }
     * ```
     */
    mixins?: Reference[];

    members?: ClassMember[];

    source?: SourceReference;

    /**
     * Whether the class or mixin is deprecated.
     * If the value is a string, it's the reason for the deprecation.
     */
    deprecated?: boolean | string;
}

export interface ClassDeclaration extends ClassLike {
    kind: 'class';
}
