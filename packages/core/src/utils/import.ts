/**
 * Checks whether the import path is from a third party library
 *
 * @param path - The import path
 * @returns True if the path is from a third party library
 */
export function isThirdParty(path: string): boolean {
    return path.length < 1000 && (/.*node_modules\/.+/.test(path) || /^https?:\/\/.+/.test(path));
}
