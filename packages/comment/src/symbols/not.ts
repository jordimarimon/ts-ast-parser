import type { CommentPart, ParserStatus, ParserSymbol } from '../models.js';
import type { Token } from '../token.js';
import { TokenKind } from '../token.js';


/**
 * This symbol will never generate serializable output.
 *
 * It's use case is to make sure that a sequence of tokens is not present.
 *
 * @param invalidKinds
 */
export function not(invalidKinds: TokenKind[]): ParserSymbol {
    const tokens: Token[] = [];

    let isValid = false;

    return {
        next(token: Token): ParserStatus {
            tokens.push(token);

            if (tokens.length < invalidKinds.length) {
                return {kind: 'in-progress'};
            }

            const isInvalidSequence = tokens.length === invalidKinds.length &&
                tokens.every((t, index) => invalidKinds[index] === t.kind);

            if (isInvalidSequence) {
                isValid = false;
                return {
                    kind: 'error',
                    error: {
                        line: token.line,
                        start: token.start,
                        end: token.end,
                        message: `Unexpected token of kind "${TokenKind[token.kind]}".`,
                    },
                };
            }

            isValid = true;

            // The sequence is valid, we need to backtrack and continue with
            // the next symbol in the production rule
            return {kind: 'backtrack', tokens};
        },

        isValid(): boolean {
            return isValid;
        },

        serialize(): CommentPart[] {
            return [];
        },
    };
}
