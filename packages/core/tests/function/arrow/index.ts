/**
 * Function that sums all the numbers in a list.
 *
 * @param list - The list of numbers to sum
 *
 * @returns The sum of all the numbers.
 */
export const sum = (...list: number[]): number => {
    return list.reduce((acc, curr) => acc + curr, 0);
}
