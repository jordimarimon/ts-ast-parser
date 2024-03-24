export function hasFlag(flags: number, flagToCheck: number): boolean {
    return (flags & flagToCheck) === flagToCheck;
}
