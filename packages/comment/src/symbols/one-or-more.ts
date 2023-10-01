import type { CommentPart, ParserStatus, ParserSymbol } from '../models.js';
import type { Token } from '../token.js';


/**
 * Tries to match one or more instances of the given symbol.
 *
 * It will only be valid if at least one instance of the symbol has been matched.
 *
 * @param factory - The function that creates the grammar symbol that may appear more than once
 *
 * @returns The grammar symbol
 */
export function oneOrMore(factory: (index: number) => ParserSymbol): ParserSymbol {
    const iterations = [factory(0)];

    let tokens: Token[] = [];

    return {
        // eslint-disable-next-line sonarjs/cognitive-complexity
        next(token: Token): ParserStatus {
            tokens.push(token);

            const symbol = iterations[iterations.length - 1] as ParserSymbol;
            const status = symbol.next(token);

            if (status.kind === 'backtrack') {
                if (!symbol.isValid()) {
                    iterations.pop(); // remove failed iteration
                    return {kind: 'backtrack', tokens};
                }

                // The current iteration is valid but some tokens
                // are not meant to be part of this iteration.
                // First we have to check if this tokens would be valid for a
                // new iteration.
                const possibleNewSymbol = factory(iterations.length);
                const tokensToCheck = status.tokens;

                let newStatus: ParserStatus | undefined;
                let lastTokenChecked = 0;
                for (let i = 0; i < tokensToCheck.length; i++) {
                    const tokenToCheck = tokensToCheck[i] as Token;

                    newStatus = possibleNewSymbol.next(tokenToCheck);
                    lastTokenChecked = i;

                    if (newStatus.kind === 'error') {
                        break;
                    }

                    if (newStatus.kind === 'success') {
                        break;
                    }

                    if (newStatus.kind === 'backtrack') {
                        lastTokenChecked -= (newStatus.tokens.length - 1);
                        break;
                    }
                }

                if (newStatus?.kind === 'error') {
                    return {
                        kind: 'backtrack',
                        tokens: status.tokens,
                    };
                }

                if (possibleNewSymbol.isValid() || newStatus?.kind === 'in-progress') {
                    tokens = tokensToCheck;
                    iterations.push(possibleNewSymbol);
                }

                if (lastTokenChecked === tokensToCheck.length - 1) {
                    return newStatus as ParserStatus;
                }

                return {
                    kind: 'backtrack',
                    tokens: tokensToCheck.slice(lastTokenChecked),
                };
            }

            if (status.kind === 'error') {
                const n = iterations.length;
                iterations.pop(); // remove failed iteration
                return n > 1
                    ? {kind: 'backtrack', tokens}
                    : status;
            }

            if (status.kind === 'success') {
                iterations.push(factory(iterations.length));
                tokens = [];
            }

            return {kind: 'in-progress'};
        },

        isValid(): boolean {
            return iterations.length > 0 && !!iterations[0]?.isValid();
        },

        serialize(): CommentPart[] {
            return iterations.flatMap(symbol => symbol.serialize());
        },
    };
}
