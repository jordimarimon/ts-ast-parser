import { createCommandLine } from './system/create-command-line.js';
import type { AnalyserSystem } from './system/analyser-system.js';
import { AnalyserDiagnostic } from './analyser-diagnostic.js';
import type { AnalyserOptions } from './analyser-options.js';
import { CompilerHost } from './system/compiler-host.js';
import { ProjectContext } from './project-context.js';
import { ModuleNode } from './nodes/module-node.js';
import type { PackageJson } from './utils/types.js';
import type { Module } from './models/module.js';
import ts from 'typescript';


/**
 * Represents a collection of modules
 * (TypeScript/JavaScript files) that have been
 * successfully analysed.
 */
export class Project {

    private _program: ts.Program;

    private _commandLine: ts.ParsedCommandLine;

    private readonly _fileNames = new Set<string>();

    private readonly _modules: ModuleNode[] = [];

    private readonly _compilerHost: CompilerHost;

    private readonly _context: ProjectContext;

    private readonly _packageJson: PackageJson | null;

    private readonly _diagnostics: AnalyserDiagnostic;

    private readonly _system: AnalyserSystem;

    private readonly _options: Partial<AnalyserOptions> = {};

    private constructor(
        system: AnalyserSystem,
        compilerHost: CompilerHost,
        program: ts.Program,
        commandLine: ts.ParsedCommandLine,
        options: Partial<AnalyserOptions> = {},
    ) {
        this._system = system;
        this._compilerHost = compilerHost;
        this._program = program;
        this._commandLine = commandLine;
        this._options = options;
        this._diagnostics = new AnalyserDiagnostic(system.getCurrentDirectory());
        this._packageJson = this._getPackageJSON();
        this._context = new ProjectContext(
            system,
            () => this._program,
            () => this._commandLine,
            this._diagnostics,
            options,
        );

        const commandLineErrors = ts.getConfigFileParsingDiagnostics(commandLine);
        this._diagnostics.addMany(commandLineErrors);
        this._diagnostics.addMany(program.getSyntacticDiagnostics());
        this._diagnostics.addMany(program.getSemanticDiagnostics());

        for (const fileName of program.getRootFileNames()) {
            const sourceFile = program.getSourceFile(fileName);

            if (!sourceFile) {
                this._diagnostics.addOne(sourceFile, `Unable to analyse file "${fileName}".`);
                continue;
            }

            this._fileNames.add(fileName);
            this._modules.push(new ModuleNode(sourceFile, this._context));
        }
    }

    static fromTSConfig(system: AnalyserSystem, options: Partial<AnalyserOptions> = {}): Project {
        const commandLine = createCommandLine(system, options);
        const compilerHost = new CompilerHost(system, commandLine.options);
        const program = ts.createProgram({
            rootNames: commandLine.fileNames,
            options: commandLine.options,
            host: compilerHost,
            projectReferences: commandLine.projectReferences ?? [],
        });

        return new Project(system, compilerHost, program, commandLine, options);
    }

    static fromFiles(
        system: AnalyserSystem,
        files: readonly string[],
        options: Partial<AnalyserOptions> = {},
    ): Project {
        const commandLine = createCommandLine(system, options);
        const compilerHost = new CompilerHost(system, commandLine.options);
        const program = ts.createProgram({
            rootNames: files.map(f => system.getAbsolutePath(f)),
            options: commandLine.options,
            host: compilerHost,
            projectReferences: commandLine.projectReferences ?? [],
        });

        return new Project(system, compilerHost, program, commandLine, options);
    }

    static fromSource(
        system: AnalyserSystem,
        source: string,
        options: Partial<AnalyserOptions> = {},
    ): Project {
        const fileName = 'unknown.ts';
        system.writeFile(fileName, source);

        const commandLine = createCommandLine(system, options);
        const compilerHost = new CompilerHost(system, commandLine.options);
        const program = ts.createProgram({
            rootNames: [system.getAbsolutePath(fileName)],
            options: commandLine.options,
            host: compilerHost,
            projectReferences: commandLine.projectReferences ?? [],
        });

        return new Project(system, compilerHost, program, commandLine, options);
    }

    /**
     * An abstraction layer around how we interact with the environment (browser or Node.js)
     *
     * @returns The system environment used
     */
    getSystem(): AnalyserSystem {
        return this._system;
    }

    /**
     * A Program is an immutable collection of source files and the compiler options. Together
     * represent a compilation unit.
     *
     * @returns The TypeScript program created with the TypeScript compiler API
     */
    getProgram(): ts.Program {
        return this._program;
    }

    /**
     * The TypeScript type checker.
     *
     * Useful to resolve the types and location of the reflected nodes.
     *
     * @returns The TypeScript type checker
     */
    getTypeChecker(): ts.TypeChecker {
        return this._program.getTypeChecker();
    }

    /**
     * The user provided analyzer options.
     *
     * @returns The options that were provided when calling the parser function
     */
    getOptions(): Partial<AnalyserOptions> {
        return this._options;
    }

    /**
     * Here we save all the errors we find while analysing the source files
     *
     * @returns An instance of the `AnalyserDiagnostic` where all errors are enqueue
     */
    getDiagnostics(): AnalyserDiagnostic {
        return this._diagnostics;
    }

    /**
     * All the reflected modules/files that have been successfully analysed.
     *
     * @returns The reflected modules
     */
    getModules(): ModuleNode[] {
        return this._modules;
    }

    /**
     * Whether the given source file path is present in the reflected modules
     *
     * @param filePath - The source file path to check
     * @returns True if the source file has been already analysed, false otherwise
     */
    has(filePath: string): boolean {
        const normalizedPath = this._context.getSystem().normalizePath(filePath);
        return this._modules.some(m => m.getSourcePath() === normalizedPath);
    }

    /**
     * Adds a new source file to the collection of reflected modules.
     *
     * Will throw an error if the source file already exists in the program.
     *
     * @param filePath - The path of the new source file
     * @param content - The content of the source file
     * @returns The new reflected module
     */
    add(filePath: string, content: string): ModuleNode {
        const normalizedPath = this._system.normalizePath(filePath);
        const absolutePath = this._system.getAbsolutePath(filePath);
        const module = this._modules.find(m => m.getSourcePath() === normalizedPath);

        if (module) {
            throw new Error('File already exist');
        }

        const newSourceFile = this._upsertFile(absolutePath, content);
        const newModuleNode = new ModuleNode(newSourceFile, this._context);

        this._modules.push(newModuleNode);

        return newModuleNode;
    }

    /**
     * Updates the content of an existing source file.
     *
     * Will throw an error if the source file doesn't exist in the program.
     *
     * @param filePath - The path of the source file to update
     * @param content - The new content of the source file
     * @returns The updated reflected module
     */
    update(filePath: string, content: string): ModuleNode {
        const normalizedPath = this._system.normalizePath(filePath);
        const absolutePath = this._system.getAbsolutePath(normalizedPath);
        const moduleIdx = this._modules.findIndex(m => m.getSourcePath() === normalizedPath);

        if (moduleIdx < 0) {
            throw new Error('The file doesn\'t exist');
        }

        // FIXME(Jordi M.): We should update all the source files
        //  that depend on the updated file

        const newSourceFile = this._upsertFile(absolutePath, content);
        const newModuleNode = new ModuleNode(newSourceFile, this._context);

        this._modules.splice(moduleIdx, 1, newModuleNode);

        return newModuleNode;
    }

    /**
     * The name of the package defined in the `package.json` in
     * case one was found
     *
     * @returns The package name if found, otherwise an empty string
     */
    getName(): string {
        return this._packageJson?.name ?? '';
    }

    /**
     * Serializes the project
     *
     * @returns The reflected node as a serializable object
     */
    serialize(): Module[] {
        return this._modules.map(m => m.serialize());
    }

    private _getPackageJSON(): PackageJson | null {
        const projectDir = this._options.tsConfigFilePath
            ? this._system.getDirectoryName(this._options.tsConfigFilePath)
            : this._system.getCurrentDirectory();

        const packageDir = this._system.join(projectDir, 'package.json');
        const pkgJSON = this._system.fileExists(packageDir) ? this._system.readFile(packageDir) : null;

        try {
            return pkgJSON != null ? (JSON.parse(pkgJSON) as PackageJson) : null;
        } catch (_) {
            return null;
        }
    }

    private _upsertFile(fileName: string, data: string): ts.SourceFile {
        this._system.writeFile(fileName, data);

        if (!this._fileNames.has(fileName)) {
            this._commandLine = createCommandLine(this._system, this._options);
            this._fileNames.add(fileName);
        }

        this._program = ts.createProgram({
            rootNames: [...this._fileNames],
            options: this._program.getCompilerOptions(),
            host: this._compilerHost,
            oldProgram: this._program,
            projectReferences: this._program.getProjectReferences() ?? [],
        });

        return this._program.getSourceFile(fileName) as ts.SourceFile;
    }
}
