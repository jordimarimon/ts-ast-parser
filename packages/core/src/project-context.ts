import type { NamedNodeName, SymbolWithLocation } from './utils/is.js';
import type { AnalyserDiagnostic } from './analyser-diagnostic.js';
import type { AnalyserSystem } from './system/analyser-system.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { ReflectedNode } from './reflected-node.js';
import ts from 'typescript';


/**
 * A class that shares common utilities between all reflected nodes
 */
export class ProjectContext {

    private readonly _getProgram: () => ts.Program;

    private readonly _getCommandLine: () => ts.ParsedCommandLine;

    private readonly _options: Partial<AnalyserOptions>;

    private readonly _diagnostics: AnalyserDiagnostic;

    private readonly _system: AnalyserSystem;

    private readonly _reflectedNodesBySymbol = new Map<ts.Symbol, ReflectedNode>();

    constructor(
        system: AnalyserSystem,
        getProgram: () => ts.Program,
        getCommandLine: () => ts.ParsedCommandLine,
        diagnostics: AnalyserDiagnostic,
        options: Partial<AnalyserOptions>,
    ) {
        this._system = system;
        this._getProgram = getProgram;
        this._getCommandLine = getCommandLine;
        this._diagnostics = diagnostics;
        this._options = options;
    }

    /**
     * A Program is an immutable collection of source files and the compiler options. Together
     * represent a compilation unit.
     *
     * @returns The TypeScript program created with the TypeScript compiler API
     */
    getProgram(): ts.Program {
        return this._getProgram();
    }

    /**
     * Returns the parsed compiler options
     */
    getCommandLine(): ts.ParsedCommandLine {
        return this._getCommandLine();
    }

    /**
     * The TypeScript type checker.
     *
     * Useful to resolve the types and location of the reflected nodes.
     *
     * @returns The TypeScript type checker
     */
    getTypeChecker(): ts.TypeChecker {
        return this._getProgram().getTypeChecker();
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
     * Here we save all the errors we find while analysing the source files
     *
     * @returns An instance of the `AnalyserDiagnostic` where all errors are enqueue
     */
    getDiagnostics(): AnalyserDiagnostic {
        return this._diagnostics;
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
     * Creates a new reflected node only if it doesn't exist already in the internal cache.
     *
     * @param node - The `ts.Node` associated with the reflected node
     * @param reflectedNodeFactory - The function to use to build the new reflection if it doesn't exist
     */
    registerReflectedNode<T extends ReflectedNode>(node: ts.Node, reflectedNodeFactory: () => T): T {
        const symbol = this.getSymbol(node);
        if (!symbol) {
            return reflectedNodeFactory();
        }

        let reflection = this._reflectedNodesBySymbol.get(symbol);
        if (!reflection) {
            reflection = reflectedNodeFactory();
            this._reflectedNodesBySymbol.set(symbol, reflection);
        }

        return reflection as T;
    }

    /**
     * Returns the associated `ts.Symbol` for the given node
     *
     * @param node - The `ts.Node` to search its symbol
     * @returns The symbol if it has one
     */
    getSymbol(node: ts.Node): ts.Symbol | null {
        const checker = this.getTypeChecker();

        let symbol = checker.getSymbolAtLocation(node);
        if (!symbol && this._isNamedNode(node)) {
            symbol = checker.getSymbolAtLocation(node.name);
        }

        // We have to check first, because the TS TypeChecker will throw an
        // error if there is no alias
        while (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
            symbol = checker.getAliasedSymbol(symbol);
        }

        if (!symbol) {
            symbol = (node as unknown as { symbol: ts.Symbol | undefined }).symbol;
        }

        return symbol ?? null;
    }

    /**
     * Given a node or a type it returns it's associated symbol, line position and the file path where
     * it was defined.
     *
     * @param nodeOrType - The node or type to search for
     * @returns The symbol, line position and path where the node/type is located
     */
    getLocation(nodeOrType: ts.Node | ts.Type): SymbolWithLocation {
        let symbol: ts.Symbol | null | undefined;

        if ('kind' in nodeOrType) {
            symbol = this.getSymbol(nodeOrType);
        } else {
            symbol = nodeOrType.aliasSymbol ?? nodeOrType.getSymbol();
        }

        const decl = symbol?.getDeclarations()?.[0];
        const sourceFile = decl?.getSourceFile();
        const path = sourceFile?.fileName
            ? this._system.normalizePath(this._system.realpath(sourceFile.fileName))
            : '';
        const line = decl ? this.getLinePosition(decl) : null;

        return { symbol, path, line };
    }

    /**
     * Returns the start line number where the node is located
     *
     * @param node - The node to locate
     * @returns The line number where the node is located
     */
    getLinePosition(node: ts.Node): number {
        return node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;
    }

    private _isNamedNode(node: ts.Node): node is ts.Node & { name: NamedNodeName } {
        const name: ts.Node | undefined = (node as unknown as { name: ts.Node | undefined }).name;
        return !!name && (ts.isMemberName(name) || ts.isComputedPropertyName(name));
    }
}
