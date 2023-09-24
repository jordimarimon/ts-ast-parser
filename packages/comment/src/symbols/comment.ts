import type { CommentPart, ParserStatus, ParserSymbol } from '../models.js';
import { description } from './description.js';
import { oneOrMore } from './one-or-more.js';
import { emptyLine } from './empty-line.js';
import { blockTag } from './block-tag.js';
import { terminal } from './terminal.js';
import { optional } from './optional.js';
import type { Token } from '../token.js';
import { TokenKind } from '../token.js';
import { oneOf } from './one-of.js';


/**
 * The initial symbol of the grammar
 */
export function comment(): ParserSymbol {
    // Right hand side of the production rule
    const symbols: ParserSymbol[] = [
        // Start of the comment
        terminal(TokenKind.Slash),
        terminal(TokenKind.Star),
        terminal(TokenKind.Star),
        optional(terminal(TokenKind.Newline)),

        // Optional description
        optional(description()),

        // Optional block tags
        optional(
            oneOrMore(() => {
                return oneOf([
                    {
                        priority: 0,
                        symbol: emptyLine(),
                    },
                    {
                        priority: 1,
                        symbol: blockTag(),
                    },
                ]);
            }),
        ),

        // End of the comment
        optional(terminal(TokenKind.Spaces, {length: 1})),
        terminal(TokenKind.Star),
        terminal(TokenKind.Slash),
    ];

    let pos = 0;

    return {
        next(token: Token): ParserStatus {
            const symbol = symbols[pos];

            if (!symbol) {
                return {
                    kind: 'error',
                    error: {
                        start: token.start,
                        end: token.end,
                        line: token.line,
                        message: `Unexpected token found at the end of the comment: "${TokenKind[token.kind]}"`,
                    },
                };
            }

            let status = symbol.next(token);

            if (status.kind === 'error') {
                return status;
            }

            if (status.kind === 'backtrack') {
                pos++;

                const tokens = status.tokens;
                for (const t of tokens) {
                    status = this.next(t);
                    if (status.kind === 'error') {
                        break;
                    }
                }
            } else if (status.kind === 'success') {
                pos++;
            }

            return pos < symbols.length
                ? {kind: 'in-progress'}
                : {kind: 'success'};
        },

        isValid(): boolean {
            return pos === symbols.length;
        },

        serialize(): CommentPart[] {
            const parts: CommentPart[] = [];

            for (const symbol of symbols) {
                parts.push(...symbol.serialize());
            }

            return parts;
        },
    };
}
