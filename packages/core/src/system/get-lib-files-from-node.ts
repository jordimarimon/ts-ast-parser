import { createRequire } from 'node:module';
import { cwd } from 'node:process';
import * as path from 'node:path';
import * as fs from 'node:fs';


const require = createRequire(import.meta.url);

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

export function getTypesFromNode(): Map<string, string> {
    const fsMap = new Map<string, string>();
    const files: string[] = [];
    const validExtensions = ['.ts', '.tsx'];

    const walk = (dir: string): void => {
        if (!fs.existsSync(dir)) {
            return;
        }

        const list = fs.readdirSync(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                /* Recurse into a subdirectory */
                walk(filePath);
            } else {
                /* Is a file */
                files.push(filePath);
            }
        }
    };

    walk(path.join(cwd(), 'node_modules', '@types'));

    for (const lib of files) {
        const content = fs.readFileSync(lib, 'utf8');

        if (validExtensions.includes(path.extname(lib))) {
            fsMap.set(path.relative(cwd(), lib), content);
        }
    }

    return fsMap;
}
