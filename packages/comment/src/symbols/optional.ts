import type { CommentPart, ParserStatus, ParserSymbol } from '../models.js';
import type { Token } from '../token.js';


/**
 * Checks it the given symbol is defined. If it's not, it won't throw an error,
 * but instead it will tell us to backtrack, and we will continue with the next symbol
 * in the production rule.
 *
 * @param symbol - The grammar symbol that may match or not
 *
 * @returns The grammar symbol
 */
export function optional(symbol: ParserSymbol): ParserSymbol {
    const tokens: Token[] = [];

    let isValid = true;

    return {
        next(token: Token): ParserStatus {
            tokens.push(token);

            const status = symbol.next(token);

            // Because the symbol is optional, if it doesn't match
            // we have to backtrack
            if (status.kind === 'error') {
                isValid = false;
                return {kind: 'backtrack', tokens};
            }

            return status;
        },

        isValid(): boolean {
            return isValid;
        },

        serialize(): CommentPart[] {
            if (!isValid) {
                return [];
            }

            return symbol.serialize();
        },
    };
}
