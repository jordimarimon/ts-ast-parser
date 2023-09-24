import type { ParserResult, ParserStatus } from './models.js';
import { comment } from './symbols/comment.js';
import { tokens } from './scanner.js';


export function parse(text: string): ParserResult {
    const symbol = comment();

    let status: ParserStatus | null = null;

    for (const token of tokens(text)) {
        status = symbol.next(token);

        if (status.kind === 'error') {
            return {
                error: status.error,
                parts: [],
            };
        }
    }

    // If the parser doesn't end with success, means
    // we have an unbalanced comment
    if (status?.kind !== 'success') {
        return {
            parts: [],
            error: {
                line: 0,
                start: 0,
                end: text.length,
                message: 'Unbalanced comment',
            },
        };
    }

    return {error: null, parts: symbol.serialize()};
}
