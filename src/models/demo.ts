import { SourceReference } from './reference';


export interface Demo {
    /**
     * A markdown description of the demo.
     */
    description?: string;

    /**
     * Relative URL of the demo if it's published with the package. Absolute URL
     * if it's hosted.
     */
    url: string;

    source?: SourceReference;
}
