import * as path from 'path';
import * as fs from 'fs';


// TODO(Jordi M.): Replace this with some sort of API call
//  if https://github.com/microsoft/TypeScript/pull/54011 or
//  similar is merged in TypeScript.

/**
 * Resolves the TypeScript declaration files from "node_modules" directory.
 * This is used when working in an in memory file system inside Node.js.
 * We need to load the declaration files in memory.
 */
export function getLibFilesFromNode(): Map<string, string> {
    const files = new Map<string, string>();
    const tsLibDirectory = path.dirname(require.resolve('typescript'));
    const libFiles = fs.readdirSync(tsLibDirectory);

    for (const lib of libFiles) {
        if (!lib.startsWith('lib.') || !lib.endsWith('d.ts')) {
            continue;
        }

        files.set(lib, fs.readFileSync(path.join(tsLibDirectory, lib), 'utf-8'));
    }

    return files;
}
