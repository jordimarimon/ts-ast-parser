import { DocScanner } from './scanner.js';


/**
 * Syntactical analyser for JSDoc comments
 */
export class DocParser {

    // @ts-expect-error It's not yet implemented
    private readonly _scanner;

    constructor(text: string) {
        this._scanner = new DocScanner(text);
    }

    parse(): void {
        // TODO
    }

}
