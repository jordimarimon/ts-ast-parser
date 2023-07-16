import * as tsvfs from '@typescript/vfs';
import type TS from 'typescript';
import * as path from 'path';
import * as fs from 'fs';


//
// We use it to fake the file system
//
export function createVirtualCompilerHost(
    fileName: string,
    source: string,
    compilerOptions: TS.CompilerOptions,
    ts: typeof TS,
): {compilerHost: TS.CompilerHost; fsMap: Map<string, string>} {
    // @see https://github.com/microsoft/TypeScript-Website/issues/2801
    // @see https://github.com/microsoft/TypeScript-Website/pull/2802
    // @see https://github.com/microsoft/TypeScript/pull/54011
    const tsLibDirectory = path.dirname(require.resolve('typescript'));
    const libFiles = fs.readdirSync(tsLibDirectory);
    const knownLibFiles = libFiles.filter(f => f.startsWith('lib.') && f.endsWith('.d.ts'));

    const fsMap = tsvfs.createDefaultMapFromNodeModules(compilerOptions, ts);
    knownLibFiles.forEach(name => fsMap.set(`/${name}`, fs.readFileSync(path.join(tsLibDirectory, name), 'utf-8')));
    fsMap.set(fileName, source);

    const system = tsvfs.createSystem(fsMap);

    return {
        fsMap,
        compilerHost: tsvfs.createVirtualCompilerHost(system, compilerOptions, ts).compilerHost,
    };
}
