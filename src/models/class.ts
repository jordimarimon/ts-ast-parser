import { Reference, SourceReference } from './reference';
import { PropertyLike } from './property';
import { FunctionLike } from './function';
import { Decorator } from './decorator';


/**
 * Type of modifier in a class member
 */
export enum ModifierType {
    public = 'public',
    private = 'private',
    protected = 'protected',
}

/**
 * Type of class member. Can be a method or a field
 */
export type ClassMember = ClassField | ClassMethod;

/**
 * Definition of a class field
 */
export interface ClassField extends PropertyLike {
    /**
     *
     */
    kind: 'field';

    /**
     *
     */
    static?: boolean;

    /**
     *
     */
    modifier?: ModifierType;

    /**
     *
     */
    inheritedFrom?: Reference;

    /**
     *
     */
    source?: SourceReference;
}

/**
 *
 */
export interface ClassMethod extends FunctionLike {
    /**
     *
     */
    kind: 'method';

    /**
     *
     */
    static?: boolean;

    /**
     *
     */
    modifier?: ModifierType;

    /**
     *
     */
    inheritedFrom?: Reference;

    /**
     *
     */
    source?: SourceReference;
}

/**
 * The common interface of classes and mixins.
 */
export interface ClassLike {
    /**
     *
     */
    name: string;

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
     */
    mixins?: Reference[];

    /**
     *
     */
    members?: ClassMember[];

    /**
     *
     */
    source?: SourceReference;

    /**
     *
     */
    decorators: Decorator[];
}

/**
 *
 */
export interface ClassDeclaration extends ClassLike {
    kind: 'class';
}
