import { PropertyLike } from './property';


export interface Parameter extends PropertyLike {
    /**
     * Whether the parameter is optional. Undefined implies non-optional.
     */
    optional?: boolean;

    /**
     * Whether the parameter is a rest parameter. Only the last parameter may be a rest parameter.
     * Undefined implies single parameter.
     */
    rest?: boolean;
}
