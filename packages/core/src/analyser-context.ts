import type { ReflectedNode, ReflectedTypeNode } from './reflected-node.js';
import type { NamedNodeName, SymbolWithLocation } from './utils/is.js';
import type { AnalyserDiagnostic } from './analyser-diagnostic.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import ts from 'typescript';


/**
 * Returns true if we're executing inside a browser
 */
export const isBrowser = typeof document === 'object' && !!document;

export class AnalyserContext {

    private readonly _program: ts.Program;

    private readonly _options: Partial<AnalyserOptions>;

    private readonly _diagnostics: AnalyserDiagnostic;

    private readonly _system: AnalyserSystem;

    private readonly _reflectedNodesBySymbol = new Map<ts.Symbol, ReflectedNode>();

    private readonly _reflectedNodesByType = new Map<ts.Type, ReflectedTypeNode>();

    constructor(
        system: AnalyserSystem,
        program: ts.Program,
        diagnostics: AnalyserDiagnostic,
        options: Partial<AnalyserOptions>,
    ) {
        this._system = system;
        this._program = program;
        this._diagnostics = diagnostics;
        this._options = options;
    }

    /**
     * A Program is an immutable collection of source files and the compiler options. Together
     * represent a compilation unit.
     */
    getProgram(): ts.Program {
        return this._program;
    }

    /**
     * The TypeScript type checker.
     *
     * Useful to resolve the types of the symbols and declarations.
     */
    getTypeChecker(): ts.TypeChecker {
        return this._program.getTypeChecker();
    }

    /**
     * An abstraction layer around how we interact with the environment (browser or Node.js)
     */
    getSystem(): AnalyserSystem {
        return this._system;
    }

    /**
     * Here we save all the errors we find while analysing the source files
     */
    getDiagnostics(): AnalyserDiagnostic {
        return this._diagnostics;
    }

    /**
     * The user provided analyzer options.
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
     * Creates a new reflected type only if it doesn't exist already in the internal cache.
     *
     * @param type - The `ts.Type` associated with the reflected type
     * @param reflectedTypeFactory - The function to use to build the new reflection if it doesn't exist
     */
    registerReflectedType<T extends ReflectedTypeNode>(type: ts.Type, reflectedTypeFactory: () => T): T {
        let reflection = this._reflectedNodesByType.get(type);

        if (!reflection) {
            reflection = reflectedTypeFactory();
            this._reflectedNodesByType.set(type, reflection);
        }

        return reflection as T;
    }

    /**
     * Returns the associated `ts.Symbol` for the given node
     *
     * @param node - The `ts.Node` to search its symbol
     *
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
            symbol = (node as unknown as { symbol: ts.Symbol | undefined })['symbol'];
        }

        return symbol ?? null;
    }

    /**
     * Given a node or a type it returns it's associated symbol, line position and the file path where
     * it was defined.
     *
     * @param nodeOrType - The node or type to search for
     *
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
        const path = this._system.normalizePath(sourceFile?.fileName) ?? '';
        const line = decl ? this.getLinePosition(decl) : null;

        return { symbol, path, line };
    }

    /**
     * Returns the start line number where the node is located
     *
     * @param node - The node to locate
     *
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
