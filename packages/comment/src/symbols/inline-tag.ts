import type { CommentPart, ParserStatus, ParserSymbol } from '../models.js';
import { optional } from './optional.js';
import { terminal } from './terminal.js';
import type { Token} from '../token.js';
import { TokenKind } from '../token.js';
import { oneOf } from './one-of.js';
import { omit } from './omit.js';


export function inlineTag(): ParserSymbol {
    const symbol = oneOf([
        {
            symbol: inlineTagWithSquareBracket(),
            priority: 0,
        },
        {
            symbol: inlineTagWithoutSquareBracket(),
            priority: 0,
        },
    ]);

    return {
        next(token: Token): ParserStatus {
            return symbol.next(token);
        },

        isValid(): boolean {
            return symbol.isValid();
        },

        serialize(): CommentPart[] {
            return symbol.serialize();
        },
    };
}

function inlineTagWithSquareBracket(): ParserSymbol {
    // [<text>]{@<tag-name> <namepathOrURL>}
    const symbols = [
        terminal(TokenKind.LeftSquareBracket),
        omit([
            {kinds: [TokenKind.AtSign], canEscape: true},
            {kinds: [TokenKind.Star, TokenKind.Slash]},
            {kinds: [TokenKind.LeftCurlyBracket], canEscape: true},
            {kinds: [TokenKind.RightSquareBracket], canEscape: true},
        ]),
        terminal(TokenKind.RightSquareBracket),
        terminal(TokenKind.LeftCurlyBracket),
        terminal(TokenKind.AtSign),
        terminal(TokenKind.AsciiWord, {serializable: true}),
        terminal(TokenKind.Spaces),
        omit([
            {kinds: [TokenKind.AtSign], canEscape: true},
            {kinds: [TokenKind.Star, TokenKind.Slash]},
            {kinds: [TokenKind.LeftSquareBracket], canEscape: true},
            {kinds: [TokenKind.RightCurlyBracket], canEscape: true},
        ]),
        terminal(TokenKind.RightCurlyBracket),
    ] as const;

    let pos = 0;
    let isValid = true;

    return {
        // eslint-disable-next-line sonarjs/cognitive-complexity
        next(token: Token): ParserStatus {
            const symbol = symbols[pos] as ParserSymbol;
            const status = symbol.next(token);

            if (status.kind === 'backtrack') {
                pos++;

                // Backtrack from the last "omit" symbol
                if (pos === symbols.length - 1) {
                    const error: ParserStatus = {
                        kind: 'error',
                        error: {
                            line: token.line,
                            start: token.start,
                            end: token.end,
                            message: `Unexpected token found "${TokenKind[token.kind]}"`,
                        },
                    };

                    return status.tokens.length === 1 ? this.next(status.tokens[0] as Token) : error;
                }

                // Backtrack from the first "omit" symbol
                let newStatus: ParserStatus | undefined;
                const n = status.tokens.length - 1;
                for (let i = 0; i <= n; i++) {
                    const backtrackedToken = status.tokens[i] as Token;
                    newStatus = this.next(backtrackedToken);

                    if (newStatus.kind === 'error') {
                        return newStatus;
                    }

                    if (newStatus.kind === 'success' && i < n) {
                        return {
                            kind: 'backtrack',
                            tokens: status.tokens.slice(i + 1),
                        };
                    }
                }

                return newStatus as ParserStatus;
            }

            if (status.kind === 'error') {
                isValid = false;
                return status;
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
            if (!isValid) {
                return [];
            }

            const kind = (symbols[5].serialize()[0]?.text ?? '') as string;
            const target = (symbols[7].serialize()[0]?.text ?? '') as string;
            const targetText = (symbols[1].serialize()[0]?.text ?? '') as string;

            return [{kind, target, targetText}];
        },
    };
}

function inlineTagWithoutSquareBracket(): ParserSymbol {
    // { @<tag-name> <namepathOrURL> | <text> }
    const symbols = [
        terminal(TokenKind.LeftCurlyBracket),
        terminal(TokenKind.AtSign),
        terminal(TokenKind.AsciiWord, {serializable: true}),
        omit([
            {kinds: [TokenKind.AtSign], canEscape: true},
            {kinds: [TokenKind.Pipe], canEscape: true},
            {kinds: [TokenKind.Star, TokenKind.Slash]},
            {kinds: [TokenKind.RightCurlyBracket], canEscape: true},
        ]),
        optional(terminal(TokenKind.Spaces)),
        optional(terminal(TokenKind.Pipe)),
        optional(terminal(TokenKind.Spaces)),
        omit([
            {kinds: [TokenKind.AtSign], canEscape: true},
            {kinds: [TokenKind.Pipe], canEscape: true},
            {kinds: [TokenKind.Star, TokenKind.Slash]},
            {kinds: [TokenKind.RightCurlyBracket], canEscape: true},
        ]),
        terminal(TokenKind.RightCurlyBracket),
    ] as const;

    let pos = 0;
    let isValid = true;

    return {
        // eslint-disable-next-line sonarjs/cognitive-complexity
        next(token: Token): ParserStatus {
            const symbol = symbols[pos] as ParserSymbol;
            const status = symbol.next(token);

            if (status.kind === 'backtrack') {
                pos++;

                // Backtrack from the last "omit" symbol
                if (pos === symbols.length - 1) {
                    const error: ParserStatus = {
                        kind: 'error',
                        error: {
                            line: token.line,
                            start: token.start,
                            end: token.end,
                            message: `Unexpected token found "${TokenKind[token.kind]}"`,
                        },
                    };

                    return status.tokens.length === 1 ? this.next(status.tokens[0] as Token) : error;
                }

                // Backtrack from the "optional" symbols
                if (pos !== 4) {
                    return this.next(status.tokens[0] as Token);
                }

                // Backtrack from the first "omit" symbol
                let newStatus: ParserStatus | undefined;
                const n = status.tokens.length - 1;
                for (let i = 0; i <= n; i++) {
                    const backtrackedToken = status.tokens[i] as Token;
                    newStatus = this.next(backtrackedToken);

                    if (newStatus.kind === 'error') {
                        return newStatus;
                    }

                    if (newStatus.kind === 'success' && i < n) {
                        return {
                            kind: 'backtrack',
                            tokens: status.tokens.slice(i + 1),
                        };
                    }
                }

                return newStatus as ParserStatus;
            }

            if (status.kind === 'error') {
                isValid = false;
                return status;
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
            if (!isValid) {
                return [];
            }

            const kind = (symbols[2].serialize()[0]?.text ?? '') as string;
            const target = (symbols[3].serialize()[0]?.text ?? '') as string;
            const targetText = (symbols[7].serialize()[0]?.text ?? '') as string;

            return [{kind, target, targetText}];
        },
    };
}
