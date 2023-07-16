import * as tsvfs from '@typescript/vfs';
import lzstring from 'lz-string';
import ts from 'typescript';


// @see https://github.com/microsoft/TypeScript-Website/issues/2801
// @see https://github.com/microsoft/TypeScript-Website/pull/2802
// @see https://github.com/microsoft/TypeScript/pull/54011
const knownLibFiles = [
    'lib.d.ts',
    'lib.decorators.d.ts',
    'lib.decorators.legacy.d.ts',
    'lib.dom.d.ts',
    'lib.dom.iterable.d.ts',
    'lib.es2015.collection.d.ts',
    'lib.es2015.core.d.ts',
    'lib.es2015.d.ts',
    'lib.es2015.generator.d.ts',
    'lib.es2015.iterable.d.ts',
    'lib.es2015.promise.d.ts',
    'lib.es2015.proxy.d.ts',
    'lib.es2015.reflect.d.ts',
    'lib.es2015.symbol.d.ts',
    'lib.es2015.symbol.wellknown.d.ts',
    'lib.es2016.array.include.d.ts',
    'lib.es2016.d.ts',
    'lib.es2016.full.d.ts',
    'lib.es2017.d.ts',
    'lib.es2017.full.d.ts',
    'lib.es2017.intl.d.ts',
    'lib.es2017.object.d.ts',
    'lib.es2017.sharedmemory.d.ts',
    'lib.es2017.string.d.ts',
    'lib.es2017.typedarrays.d.ts',
    'lib.es2018.asyncgenerator.d.ts',
    'lib.es2018.asynciterable.d.ts',
    'lib.es2018.d.ts',
    'lib.es2018.full.d.ts',
    'lib.es2018.intl.d.ts',
    'lib.es2018.promise.d.ts',
    'lib.es2018.regexp.d.ts',
    'lib.es2019.array.d.ts',
    'lib.es2019.d.ts',
    'lib.es2019.full.d.ts',
    'lib.es2019.intl.d.ts',
    'lib.es2019.object.d.ts',
    'lib.es2019.string.d.ts',
    'lib.es2019.symbol.d.ts',
    'lib.es2020.bigint.d.ts',
    'lib.es2020.d.ts',
    'lib.es2020.date.d.ts',
    'lib.es2020.full.d.ts',
    'lib.es2020.intl.d.ts',
    'lib.es2020.number.d.ts',
    'lib.es2020.promise.d.ts',
    'lib.es2020.sharedmemory.d.ts',
    'lib.es2020.string.d.ts',
    'lib.es2020.symbol.wellknown.d.ts',
    'lib.es2021.d.ts',
    'lib.es2021.full.d.ts',
    'lib.es2021.intl.d.ts',
    'lib.es2021.promise.d.ts',
    'lib.es2021.string.d.ts',
    'lib.es2021.weakref.d.ts',
    'lib.es2022.array.d.ts',
    'lib.es2022.d.ts',
    'lib.es2022.error.d.ts',
    'lib.es2022.full.d.ts',
    'lib.es2022.intl.d.ts',
    'lib.es2022.object.d.ts',
    'lib.es2022.regexp.d.ts',
    'lib.es2022.sharedmemory.d.ts',
    'lib.es2022.string.d.ts',
    'lib.es2023.array.d.ts',
    'lib.es2023.d.ts',
    'lib.es2023.full.d.ts',
    'lib.es5.d.ts',
    'lib.es6.d.ts',
    'lib.esnext.d.ts',
    'lib.esnext.full.d.ts',
    'lib.esnext.intl.d.ts',
    'lib.scripthost.d.ts',
    'lib.webworker.d.ts',
    'lib.webworker.importscripts.d.ts',
    'lib.webworker.iterable.d.ts',
];

export async function createBrowserCompilerHost(
    fileName: string,
    source: string,
    compilerOptions: ts.CompilerOptions,
): Promise<{ compilerHost: ts.CompilerHost; fsMap: Map<string, string> }> {
    const fsMap = await createDefaultMapFromCDN(ts.version);
    fsMap.set(fileName, source);

    const system = tsvfs.createSystem(fsMap);

    return {
        fsMap,
        compilerHost: tsvfs.createVirtualCompilerHost(system, compilerOptions, ts).compilerHost,
    };
}

function createDefaultMapFromCDN(version: string): Promise<Map<string, string>> {
    const fsMap = new Map<string, string>();
    const keys = Object.keys(localStorage);
    const prefix = `https://typescript.azureedge.net/cdn/${version}/typescript/lib/`;

    // compression utilities
    const zip = (str: string): string => lzstring.compressToUTF16(str);
    const unzip = (str: string): string => lzstring.decompressFromUTF16(str);

    for (const key of keys) {
        // Remove anything which isn't from this version
        if (key.startsWith('ts-lib-') && !key.startsWith(`ts-lib-${ version}`)) {
            localStorage.removeItem(key);
        }
    }

    const promises = knownLibFiles.map(lib => {
        const cacheKey = `ts-lib-${version}-${lib}`;
        const content = localStorage.getItem(cacheKey);

        if (!content) {
            // Make the API call and store the text concent in the cache
            return fetch(prefix + lib)
                .then(resp => resp.text())
                .then(t => {
                    localStorage.setItem(cacheKey, zip(t));
                    return t;
                });
        }
        return Promise.resolve(unzip(content));

    });

    return Promise.all(promises)
        .then(contents => {
            contents.forEach((text, index) => fsMap.set(`/${ knownLibFiles[index]}`, text));
        })
        .then(() => fsMap);
}
