import type { CommentPart, ParserStatus, ParserSymbol } from '../models.js';
import { descriptionLine, serializeDescription } from './description.js';
import { type Token, TokenKind } from '../token.js';
import { oneOrMore } from './one-or-more.js';
import { terminal } from './terminal.js';
import { optional } from './optional.js';
import { oneOf } from './one-of.js';
import { omit } from './omit.js';


export const blockTagsWithoutName = [
    'access', 'author', 'default', 'defaultvalue',
    'description', 'example', 'exception', 'file',
    'fileoverview', 'kind', 'license', 'overview',
    'return', 'returns', 'since', 'summary',
    'throws', 'version', 'variation',
];

export function blockTag(): ParserSymbol {
    // @<tag_name> {<type>} [<name> = <default_value>] - <description>
    const symbols = [
        terminal(TokenKind.Spaces, {length: 1}),
        optional(terminal(TokenKind.Star)),
        optional(terminal(TokenKind.Spaces)),
        terminal(TokenKind.AtSign),
        terminal(TokenKind.AsciiWord, {serializable: true}), // <tag_name>
        optional(terminal(TokenKind.Spaces)),
        optional(type()),
        optional(terminal(TokenKind.Spaces)),
        optional(oneOf([
            {
                symbol: terminal(TokenKind.AsciiWord, {serializable: true}),
                priority: 0,
            },
            {
                symbol: optionalName(),
                priority: 1,
            },
        ])),
        optional(terminal(TokenKind.Spaces)),
        optional(terminal(TokenKind.Hyphen)),
        optional(terminal(TokenKind.Spaces)),
        optional(oneOrMore((index: number) => {
            return descriptionLine({startPadding: index > 0, standaloneLine: index > 0});
        })),
    ];

    let pos = 0;

    return {
        // eslint-disable-next-line sonarjs/cognitive-complexity
        next(token: Token): ParserStatus {
            const symbol = symbols[pos] as ParserSymbol;
            const status = symbol.next(token);

            if (status.kind === 'backtrack') {
                pos++;

                // Case of backtracking from the description symbol
                if (pos === symbols.length) {
                    return status;
                }

                // Case of backtracking from the rest of optional symbols
                if (pos !== 7 && pos !== 9) {
                    return this.next(status.tokens[0] as Token);
                }

                // Case of backtracking from the type or name symbol
                let newStatus: ParserStatus | undefined;
                for (let i = 0; i < status.tokens.length; i++) {
                    const backtrackedToken = status.tokens[i] as Token;
                    newStatus = this.next(backtrackedToken);

                    if (newStatus.kind === 'error') {
                        return status;
                    }

                    // The only one that can tell us to backtrack
                    // here is the description symbol
                    if (newStatus.kind === 'backtrack') {
                        return {
                            kind: 'backtrack',
                            tokens: newStatus.tokens.concat(status.tokens.slice(i + 1)),
                        };
                    }
                }

                return newStatus as ParserStatus;
            }

            if (status.kind === 'error') {
                return status;
            }

            if (status.kind === 'success') {
                pos++;
            }

            return {kind: 'in-progress'};
        },

        isValid(): boolean {
            return pos > 4;
        },

        // eslint-disable-next-line sonarjs/cognitive-complexity
        serialize(): CommentPart[] {
            if (pos <= 4) {
                return [];
            }

            const result: CommentPart = {};

            const kind = (symbols[4]?.serialize()[0]?.text ?? '') as string;
            const typeText = (symbols[6]?.serialize()[0]?.text ?? '') as string;
            const nameAndDefault = symbols[8]?.serialize()[0];
            const isOptional = !!nameAndDefault?.optional;
            const defaultValueText = nameAndDefault?.default ?? '';

            let name = (nameAndDefault?.name ?? '') || (nameAndDefault?.text ?? '') as string;
            let text = serializeDescription(symbols[symbols.length - 1]?.serialize() ?? []);

            if (blockTagsWithoutName.includes(kind)) {
                text = typeof text === 'string'
                    ? [name, text].join(' ').trim()
                    : [{kind: 'text', text: name}, ...text];
                name = '';
            }

            if (Array.isArray(text) && !text.length) {
                text = '';
            }

            result.kind = kind;

            if (name) {
                result.name = name;
            }

            if (text) {
                result.text = text;
            }

            if (typeText) {
                result.type = typeText;
            }

            if (isOptional) {
                result.optional = true;
            }

            if (defaultValueText) {
                result.default = defaultValueText;
            }

            return [result];
        },
    };
}

function type(): ParserSymbol {
    const tokens: Token[] = [];

    let brackets = 0;
    let isValid = true;

    return {
        next(token: Token): ParserStatus {
            tokens.push(token);

            if (token.kind === TokenKind.LeftCurlyBracket) {
                brackets++;
                return {kind: 'in-progress'};
            }

            if (!brackets) {
                isValid = false;
                return {
                    kind: 'error',
                    error: {
                        line: token.line,
                        start: token.start,
                        end: token.end,
                        message: `Expected a left curly bracket but found "${TokenKind[token.kind]}"`,
                    },
                };
            }

            if (token.kind === TokenKind.RightCurlyBracket) {
                brackets--;

                if (brackets > 0) {
                    return {kind: 'in-progress'};
                }

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

            return [{
                kind: 'text',
                text: tokens.slice(1, -1).map(token => token.toString()).join('').trim(),
            }];
        },
    };
}

function optionalName(): ParserSymbol {
    const symbols = [
        terminal(TokenKind.LeftSquareBracket),
        terminal(TokenKind.AsciiWord, {serializable: true}),
        defaultValue(),
        terminal(TokenKind.RightSquareBracket),
    ] as const;

    const tokens: Token[] = [];

    let pos = 0;
    let isValid = true;

    return {
        next(token: Token): ParserStatus {
            tokens.push(token);

            const symbol = symbols[pos] as ParserSymbol;
            const status = symbol.next(token);

            if (status.kind === 'backtrack') {
                pos++;
                isValid = true;

                // We can only receive a backtrack status from the "defaultValue" symbol
                return status.tokens.length > 1
                    ? {kind: 'backtrack', tokens}
                    : this.next(status.tokens[0] as Token);
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
            if (!isValid) {
                return [];
            }

            const name = (symbols[1].serialize()[0]?.text ?? '') as string;
            const defaultValueText = (symbols[2].serialize()[0]?.text ?? '') as string;

            return [{name, default: defaultValueText, optional: true}];
        },
    };
}

function defaultValue(): ParserSymbol {
    const symbols = [
        terminal(TokenKind.Equal),
        omit([
            {kinds: [TokenKind.Newline]},
            {kinds: [TokenKind.Star, TokenKind.Slash]},
            {kinds: [TokenKind.AtSign], canEscape: true},
            {kinds: [TokenKind.RightSquareBracket], canEscape: true},
        ]),
    ] as const;

    const tokens: Token[] = [];

    let pos = 0;
    let isValid = true;

    return {
        next(token: Token): ParserStatus {
            tokens.push(token);

            const symbol = symbols[pos] as ParserSymbol;
            const status = symbol.next(token);

            if (status.kind === 'backtrack') {
                pos++;
                isValid = true;
                return status;
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
            if (!isValid) {
                return [];
            }

            return [{text: (symbols[1].serialize()[0]?.text ?? '') as string}];
        },
    };
}
