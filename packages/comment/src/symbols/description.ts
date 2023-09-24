import type { CommentPart, ParserStatus, ParserSymbol } from '../models.js';
import { oneOrMore } from './one-or-more.js';
import { inlineTag } from './inline-tag.js';
import { terminal } from './terminal.js';
import type { Token } from '../token.js';
import { TokenKind } from '../token.js';
import { optional } from './optional.js';
import { oneOf } from './one-of.js';
import { omit } from './omit.js';
import { not } from './not.js';


export interface DescriptionLineOptions {
    standaloneLine: boolean;
    startPadding: boolean;
}

export function description(): ParserSymbol {
    // The right hand side of the production rule.
    // A description can be in multiple lines.
    const symbol = oneOrMore((index: number) => {
        return descriptionLine({startPadding: true, standaloneLine: index > 0});
    });

    return {
        next(token: Token): ParserStatus {
            return symbol.next(token);
        },

        isValid(): boolean {
            return symbol.isValid();
        },

        serialize(): CommentPart[] {
            const text = serializeDescription(symbol.serialize());

            if (!text.length) {
                return [];
            }

            return [{kind: 'description', text}];
        },
    };
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function descriptionLine(options: DescriptionLineOptions): ParserSymbol {
    const symbols = [
        options.startPadding
            ? terminal(TokenKind.Spaces, {length: 1})
            : optional(terminal(TokenKind.Spaces, {length: 1})),
        not([TokenKind.Star, TokenKind.Slash]),
        options.standaloneLine
            ? terminal(TokenKind.Star)
            : optional(terminal(TokenKind.Star)),
        optional(terminal(TokenKind.Spaces)),
        not([TokenKind.AtSign]),
        optional(
            oneOrMore(() => {
                return oneOf([
                    {
                        priority: 0,
                        symbol: omit([
                            {kinds: [TokenKind.LeftSquareBracket], canEscape: true},
                            {kinds: [TokenKind.LeftCurlyBracket], canEscape: true},
                            {kinds: [TokenKind.Newline]},
                            {kinds: [TokenKind.Star, TokenKind.Slash]},
                            {kinds: [TokenKind.AtSign], canEscape: true},
                        ]),
                    },
                    {
                        priority: 1,
                        symbol: inlineTag(),
                    },
                ]);
            }),
        ),
        optional(terminal(TokenKind.Newline, {serializable: true})),
    ];

    let pos = 0;
    let isValid = false;
    let tokens: Token[] = [];

    return {
        // eslint-disable-next-line sonarjs/cognitive-complexity
        next(token: Token): ParserStatus {
            tokens.push(token);

            const symbol = symbols[pos] as ParserSymbol;
            const status = symbol.next(token);

            if (status.kind === 'backtrack') {
                pos++;

                // Backtracking from the last "optional()" state
                if (pos === symbols.length) {
                    isValid = true;
                    return status;
                }

                // Backtracking from the "oneOrMore()" state
                if (pos === symbols.length - 1) {
                    const backtrackToken = status.tokens[0] as Token;
                    const isEndOfInput = status.tokens.length > 1; // -> */

                    if (backtrackToken.kind === TokenKind.AtSign) {
                        isValid = false;
                        return {kind: 'backtrack', tokens};
                    }

                    if (isEndOfInput) {
                        isValid = true;
                        return status;
                    }

                    return this.next(backtrackToken);
                }

                // Backtracking from intermediate "optional()" states
                if (pos !== 2) {
                    return this.next(status.tokens[0] as Token);
                }

                // Backtracking from the "not()" state
                tokens = tokens.slice(0, tokens.length - status.tokens.length);

                let newStatus: ParserStatus | undefined;
                const n = status.tokens.length - 1;
                for (let i = 0; i <= n; i++) {
                    const backtrackToken = status.tokens[i] as Token;
                    newStatus = this.next(backtrackToken);

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
            return symbols.flatMap(symbol => symbol.serialize());
        },
    };
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function serializeDescription(parts: CommentPart[]): string | CommentPart[] {
    const result: CommentPart[] = [];
    const isEmptyOrNewLine = parts.every(p => p.kind === 'text' && (p.text === '' || p.text === '\n'));

    // Also handles the case where we have an empty array
    if (isEmptyOrNewLine) {
        return [];
    }

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i] as CommentPart;
        const previousPart = result[result.length - 1];
        const isLastPart = i === parts.length - 1;
        const isNewLine = typeof part.text === 'string' && part.text === '\n';

        // Filter the last new line character
        if (isNewLine && isLastPart) {
            continue;
        }

        // Filter two or more consecutive new line characters
        if (part.kind === 'text' && previousPart?.kind === 'text') {
            const previousText = (previousPart.text ?? '') as string;
            const previousCharIsNewLine = previousText.endsWith('\n');
            const currText = isNewLine && previousCharIsNewLine ? '' : ((part.text ?? '') as string);

            previousPart.text = previousText + currText;
            continue;
        }

        result.push(part);
    }

    // If there is only text, return the raw text
    if (result.length === 1 && result[0]?.kind === 'text') {
        // Make sure there is no NewLine character at the start or at the end
        return ((result[0]?.text as string | undefined) ?? '').replace(/^\n+|\n+$/, '');
    }

    // Case when there is text and inline tags
    return result;
}
