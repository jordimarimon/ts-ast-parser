import ts from 'typescript';


// Inspired by the following resources:
//      https://learning-notes.mistermicheels.com/javascript/typescript/compiler-api/
//      https://github.com/AlCalzone/virtual-tsc/blob/master/src/virtual-fs.ts
//      https://github.com/AlCalzone/virtual-tsc/blob/master/src/host.ts
export function createVirtualCompilerHost(
    fileName: string,
    code: string,
    options: ts.CompilerOptions = {},
): ts.CompilerHost {

    const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true);
    const defaultCompilerHost = ts.createCompilerHost(options);
    const files: { [key: string]: ts.SourceFile } = {
        [fileName]: sourceFile,
    };

    return {

        getSourceFile: (name: string, languageVersion): ts.SourceFile | undefined => {
            if (files[name] !== undefined) {
                return files[name];
            }

            return defaultCompilerHost.getSourceFile(name, languageVersion);
        },

        writeFile: (name: string, content: string): void => {
            files[name] = ts.createSourceFile(name, content, ts.ScriptTarget.Latest, true);
        },

        getDefaultLibFileName: () => 'lib.d.ts',

        useCaseSensitiveFileNames: () => false,

        getCanonicalFileName: filename => filename,

        getCurrentDirectory: () => '',

        getNewLine: () => '\n',

        getDirectories: () => [],

        fileExists: () => true,

        readFile: () => '',

    };

}
