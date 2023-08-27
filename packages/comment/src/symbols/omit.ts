import type { CommentPart, ParserStatus, ParserSymbol } from '../models.js';
import type { Token } from '../token.js';
import { TokenKind } from '../token.js';


export interface OmitOptions {
    kinds: TokenKind[];
    canEscape?: boolean;
}

/**
 * Accepts any token except the sequences provided as arguments.
 * An invalid sequence can be escaped to be considered as valid.
 *
 * @param omittedSequences
 */
export function omit(omittedSequences: OmitOptions[]): ParserSymbol {
    let tokens: Token[] = [];
    let isValid = true;

    return {
        next(token: Token): ParserStatus {
            tokens.push(token);

            let backtrack = 0;

            for (const {kinds, canEscape} of omittedSequences) {
                if (tokens.length < kinds.length) {
                    continue;
                }

                const isEscaped = canEscape && tokens[tokens.length - kinds.length - 1]?.kind === TokenKind.Backslash;
                const matches = kinds.every((kind, index) => {
                    return tokens[tokens.length - kinds.length + index]?.kind === kind;
                });

                if (matches && !isEscaped) {
                    backtrack = kinds.length;
                    break;
                }
            }

            if (!backtrack) {
                return {kind: 'in-progress'};
            }

            const backtrackTokens = tokens.slice(tokens.length - backtrack);

            // Remove the invalid tokens
            tokens = tokens.slice(0, tokens.length - backtrack);
            isValid = tokens.length > 0;

            return {kind: 'backtrack', tokens: backtrackTokens};
        },

        isValid(): boolean {
            return isValid;
        },

        serialize(): CommentPart[] {
            if (!isValid) {
                return [];
            }

            return [{
                kind: 'text',
                text: tokens.map(token => token.toString()).join('').trim(),
            }];
        },
    };
}
