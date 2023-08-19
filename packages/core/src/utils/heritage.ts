import type { ProjectContext } from '../project-context.js';
import type { ClassLikeNode } from './is.js';
import type ts from 'typescript';


/**
 * Checks it the node is a custom element. As of right now we treat a node to be a custom element
 * if HTMLElement is in the heritage chain.
 *
 * @param node - The node to check
 * @param context - The analyzer context where the node belongs to
 *
 * @returns True if the node extends HTMLElement
 */
export function isCustomElement(node: ClassLikeNode, context: ProjectContext): boolean {
    const checker = context.getTypeChecker();
    const type = checker.getTypeAtLocation(node);
    const baseTypes = type.isClassOrInterface() ? checker.getBaseTypes(type) : [];

    for (const baseType of baseTypes) {
        if (hasHTMLElementAsBase(baseType, checker)) {
            return true;
        }
    }

    return false;
}

/**
 * Checks in the heritage chain if there is an HTMLElement type.
 *
 * @param type - The base type to check
 * @param checker - The TypeScript type checker from the analyzer context
 *
 * @returns True if HTMLElement has been found as a base type
 */
export function hasHTMLElementAsBase(type: ts.Type, checker: ts.TypeChecker): boolean {
    const name = type.getSymbol()?.getName();

    if (name === 'HTMLElement') {
        return true;
    }

    if (!type.isClassOrInterface()) {
        return false;
    }

    return checker.getBaseTypes(type).some(t => hasHTMLElementAsBase(t, checker));
}
