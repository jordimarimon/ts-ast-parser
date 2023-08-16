/**
 * A binding element after being serialized
 */
export interface BindingElement {
    /**
     * The name of the element
     */
    name: string;

    /**
     * The default value
     */
    default?: unknown;
}
