import type { CommentPart, ParserStatus, ParserSymbol } from '../models.js';
import { terminal } from './terminal.js';
import { optional } from './optional.js';
import type { Token} from '../token.js';
import { TokenKind } from '../token.js';


export function emptyLine(): ParserSymbol {
    const symbols = [
        terminal(TokenKind.Spaces, {length: 1}),
        terminal(TokenKind.Star),
        optional(terminal(TokenKind.Spaces)),
        terminal(TokenKind.Newline),
    ];

    const tokens: Token[] = [];

    let pos = 0;
    let isValid = false;

    return {
        next(token: Token): ParserStatus {
            tokens.push(token);

            const symbol = symbols[pos] as ParserSymbol;
            const status = symbol.next(token);

            if (status.kind === 'backtrack') {
                pos++;

                // Only the "optional()" non terminal can make us backtrack
                const backtrackToken = status.tokens[0] as Token;

                // remove the already appended token because we are going to call
                // again "next()"
                tokens.pop();

                return this.next(backtrackToken);
            }

            if (status.kind === 'error') {
                isValid = false;
                return {kind: 'backtrack', tokens};
            }

            if (status.kind === 'success') {
                pos++;
            }

            if (pos === symbols.length) {
                isValid = true;
                return {kind: 'success'};
            }

            return {kind: 'in-progress'};
        },

        isValid(): boolean {
            return isValid;
        },

        serialize(): CommentPart[] {
            return [];
        },
    };
}
