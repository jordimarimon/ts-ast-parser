import type { DocTagValue } from '../models/js-doc.js';


/**
 * Represents the reflected documentation tag
 */
export class JSDocValueNode {

    private readonly _kind: string;

    private readonly _jsDocTagValue: DocTagValue;

    constructor(kind: string, jsDocTagValue: DocTagValue) {
        this._kind = kind;
        this._jsDocTagValue = jsDocTagValue;
    }

    /**
     * The kind of tag (name of the tag)
     */
    getKind(): string {
        return this._kind;
    }

    /**
     * The name if available
     */
    getName(): string {
        if (typeof this._jsDocTagValue === 'string' || typeof this._jsDocTagValue === 'boolean') {
            return '';
        }

        return this._jsDocTagValue.name ?? '';
    }

    /**
     * The description if available
     */
    getDescription(): string {
        if (typeof this._jsDocTagValue === 'string') {
            return this._jsDocTagValue;
        }

        if (typeof this._jsDocTagValue === 'boolean') {
            return '';
        }

        return this._jsDocTagValue.description ?? '';
    }

    /**
     * The type if available
     */
    getType(): string {
        if (typeof this._jsDocTagValue === 'string' || typeof this._jsDocTagValue === 'boolean') {
            return '';
        }

        return this._jsDocTagValue.type ?? '';
    }

    /**
     * The default value if available
     */
    getDefault(): string {
        if (typeof this._jsDocTagValue === 'string' || typeof this._jsDocTagValue === 'boolean') {
            return '';
        }

        return this._jsDocTagValue.default ?? '';
    }

    /**
     * If it's optional
     */
    isOptional(): boolean {
        if (typeof this._jsDocTagValue === 'string' || typeof this._jsDocTagValue === 'boolean') {
            return false;
        }

        return !!this._jsDocTagValue.optional;
    }

    /**
     * The reflected node as a serializable object
     */
    serialize<T extends DocTagValue = DocTagValue>(): T {
        return this._jsDocTagValue as T;
    }
}
