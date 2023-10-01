import type { CommentPart, ParserStatus, ParserSymbol } from '../models.js';
import type { Token } from '../token.js';
import { TokenKind } from '../token.js';


export interface TerminalOptions {
    length: number;
    serializable: boolean;
}

/**
 * Represents a token in a production rule
 *
 * @param expectedKind - The token kind that should match
 * @param options - Options to configure the behaviour
 *
 * @returns The grammar symbol
 */
export function terminal(expectedKind: TokenKind, options?: Partial<TerminalOptions>): ParserSymbol {
    let acceptedToken: Token | null = null;

    return {
        next(token: Token): ParserStatus {
            const hasExpectedLength = options?.length == null || token.length === options.length;

            if (token.kind === expectedKind && hasExpectedLength) {
                acceptedToken = token;
                return {kind: 'success'};
            }

            return {
                kind: 'error',
                error: {
                    line: token.line,
                    start: token.start,
                    end: token.end,
                    message: `Expected token of kind "${TokenKind[expectedKind]}" but instead found "${TokenKind[token.kind]}".`,
                },
            };
        },

        isValid(): boolean {
            return !!acceptedToken;
        },

        serialize(): CommentPart[] {
            const text = (acceptedToken?.toString() ?? '');

            return options?.serializable && text
                ? [{kind: 'text', text}]
                : [];
        },
    };
}
