import type { CommentPart, ParserError, ParserStatus, ParserSymbol } from '../models.js';
import type { Token } from '../token.js';


interface BranchState {
    valid: boolean;
    finalized: boolean;
    error?: ParserError;
    backtrackTokens: Token[];
}

interface Branch {
    symbol: ParserSymbol;
    priority: number;
}

/**
 * Tries to match one of the given branches.
 *
 * If multiple branches match the current input, the "priority" field will be used
 * to decide which branch to accept to resolve the ambiguity.
 *
 * @param branches - The different branches available to choose
 *
 * @returns The grammar symbol
 */
export function oneOf(branches: Branch[]): ParserSymbol {
    const branchesState = branches.reduce<Record<number, BranchState>>((acc, _, index) => {
        acc[index] = {
            valid: true,
            finalized: false,
            backtrackTokens: [],
        };
        return acc;
    }, {});

    let acceptedBranch: number | null = null;

    return {
        next(token: Token): ParserStatus {
            for (let i = 0; i < branches.length; i++) {
                const state = branchesState[i] as BranchState;
                const branch = branches[i] as Branch;
                const currAcceptedBranch = acceptedBranch != null
                    ? branches[acceptedBranch] as Branch
                    : null;

                const currAcceptedBranchState = acceptedBranch != null
                    ? branchesState[acceptedBranch] as BranchState
                    : null;

                if (!currAcceptedBranchState?.valid) {
                    acceptedBranch = null;
                }

                handleBranch(token, branch, state);

                // Of all the accepted branches we will accept the largest one
                if (
                    state.finalized &&
                    state.valid &&
                    (!currAcceptedBranch || currAcceptedBranch.priority < branch.priority)
                ) {
                    acceptedBranch = i;
                }
            }

            const states = Object.values(branchesState);

            if (states.every(s => !s.valid)) {
                return {
                    kind: 'error',
                    // We only return the error of the first branch
                    error: branchesState[0]?.error as ParserError,
                };
            }

            // There are still pending branches to be finalized
            if (acceptedBranch == null || states.some(s => s.valid && !s.finalized)) {
                return {kind: 'in-progress'};
            }

            const acceptedBranchState = branchesState[acceptedBranch] as BranchState;
            if (acceptedBranchState.backtrackTokens.length > 0) {
                return {kind: 'backtrack', tokens: acceptedBranchState.backtrackTokens};
            }

            return {kind: 'success'};
        },

        isValid(): boolean {
            return acceptedBranch != null && !!branchesState[acceptedBranch]?.valid;
        },

        serialize(): CommentPart[] {
            if (acceptedBranch == null) {
                return [];
            }

            return (branches[acceptedBranch] as Branch).symbol.serialize();
        },
    };
}

function handleBranch(token: Token, branch: Branch, state: BranchState): void {
    // If the branch is already not valid ignore future tokens
    if (!state.valid) {
        return;
    }

    // If the branch has been a success, save future tokens as backtrack
    if (state.finalized) {
        state.backtrackTokens.push(token);
        return;
    }

    const symbol = branch.symbol;
    const status = symbol.next(token);

    if (status.kind === 'in-progress') {
        return;
    }

    if (status.kind === 'success') {
        state.valid = true;
        state.finalized = true;
        return;
    }

    if (status.kind === 'error') {
        state.valid = false;
        state.error = status.error;
        return;
    }

    // backtrack
    state.finalized = true;
    state.valid = symbol.isValid();
    state.backtrackTokens = status.tokens;
}
