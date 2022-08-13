import { logError } from './utils/index.js';
import { Module } from './models/index.js';
import { Context } from './context.js';
import ts from 'typescript';


export function callPlugins(sourceFiles: (ts.SourceFile | undefined)[], modules: Module[]): void {
    const plugins = Context.options.plugins ?? [];
    const checker = Context.checker;

    if (!Array.isArray(plugins)) {
        return;
    }

    for (const sourceFile of sourceFiles) {

        for (const plugin of plugins) {
            try {
                plugin?.handler?.(sourceFile, modules, checker);
            } catch (error: unknown) {
                logError(`The plugin "${plugin?.name}" has thrown the following error:`, error);
            }
        }

    }
}
