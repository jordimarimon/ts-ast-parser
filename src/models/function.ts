import { SourceReference } from './reference';
import { PropertyLike } from './property';
import { Type } from './type';


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

export interface FunctionLike {
    name: string;

    /**
     * A markdown summary suitable for display in a listing.
     */
    summary?: string;

    /**
     * A markdown description.
     */
    description?: string;

    parameters?: Parameter[];

    return?: {
        type?: Type;
        description?: string;
    };
}

export interface FunctionDeclaration extends FunctionLike {
    kind: 'function';
    source?: SourceReference;
}
