import { Declaration } from 'typescript';
import { Export } from './export';


export interface Module {
    /**
     * Path to the javascript file needed to be imported.
     * (not the path for example to a typescript file.)
     */
    path: string;

    /**
     * A markdown summary suitable for display in a listing.
     */
    summary?: string;

    /**
     * A markdown description of the module.
     */
    description?: string;

    /**
     * The declarations of a module.
     *
     * For documentation purposes, all declarations that are reachable from
     * exports should be described here. Ie, functions and objects that may be
     * properties of exported objects, or passed as arguments to functions.
     */
    declarations?: Declaration[];

    /**
     * The exports of a module. This includes JavaScript exports and
     * custom element definitions.
     */
    exports?: Export[];

    /**
     * Whether the module is deprecated.
     * If the value is a string, it's the reason for the deprecation.
     */
    deprecated?: boolean | string;
}
