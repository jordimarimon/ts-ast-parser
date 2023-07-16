import type { Type, TypeReference } from '../models/type.js';
import { tryAddProperty } from './try-add-property.js';
import type { AnalyserContext } from '../context.js';
import { getLocation } from './get-location.js';
import { isThirdParty } from './import.js';
import ts from 'typescript';


/**
 * Converts the TypeScript type node to a simplified version of it
 *
 * @param type - The Typescript type node
 * @param context - The analyzer context where the type belongs to
 *
 * @returns The simplified type
 */
export function getTypeFromTSType(type: ts.Type | undefined, context: AnalyserContext): Type {
    if (type) {
        const name = context.checker.typeToString(type) ?? '';
        const result: Type = {text: name};

        tryAddProperty(result, 'sources', getTypeReferences(type, context));

        return result;
    }

    return {text: ''};
}

/**
 * Returns the location of where the type has been defined
 *
 * @param type - The Typescript type node
 * @param context - The analyzer context where the type belongs to
 *
 * @returns The type definition location
 */
export function getTypeReferences(type: ts.Type | undefined, context: AnalyserContext): TypeReference[] {
    if (!type) {
        return [];
    }

    const checker = context.checker;
    const node = checker.typeToTypeNode(type, void 0, ts.NodeBuilderFlags.IgnoreErrors);

    let result: TypeReference[] = [];

    if (!node) {
        return [];
    }

    // CASE of => TypeX[]
    if (ts.isArrayTypeNode(node) && ts.isTypeReferenceNode(node.elementType)) {
        const elementType = getTypeReferences(checker.getTypeArguments(type as ts.TypeReference)?.[0], context);
        result = result.concat(elementType);
    }

    // CASE of an Intersection type => TypeX & TypeY
    else if (ts.isIntersectionTypeNode(node)) {
        const elementTypes = (type as ts.IntersectionType).types.flatMap(t => getTypeReferences(t, context));
        result = result.concat(elementTypes);
    }

    // CASE of a Union type => TypeX | TypeY
    else if (ts.isUnionTypeNode(node)) {
        const elementTypes = (type as ts.UnionType).types.flatMap(t => getTypeReferences(t, context));
        result = result.concat(elementTypes);
    }

    // CASE of => TypeX
    else if (ts.isTypeReferenceNode(node)) {
        const name = checker.typeToString(type) ?? '';
        const {path, line} = getLocation(type, context);

        if (line != null && path && !isThirdParty(path)) {
            result.push({text: name, path, line});
        }
    }

    return result;
}

/**
 * Gets the simplified type from a node
 *
 * @param node - The node to extract the type from
 * @param context - The analyzer context where the node belongs to
 *
 * @returns The simplified type of the node
 */
export function getTypeFromNode(node: ts.Node, context: AnalyserContext): Type {
    const type = getTSType(node, context.checker);

    return getTypeFromTSType(type, context);
}

/**
 * Given a node, it returns the TypeScript type
 *
 * @param node - The node to get the type from
 * @param checker - The analyzer context where the type belongs to
 *
 * @returns The node type
 */
export function getTSType(node: ts.Node, checker: ts.TypeChecker): ts.Type | undefined {
    const type = checker.getTypeAtLocation(node);

    // Don't generalize the type of declarations like "const x = [4, 5] as const"
    if (isTypeAssertion(node)) {
        return type;
    }

    // Don't use the inferred literal types.
    // For example "const x = 4" gives "x: 4" instead of "x: number"
    return type && checker.getBaseTypeOfLiteralType(type);
}

/**
 * Checks whether the node has a type assertion
 *
 * For example:
 *
 *      const foo = [4, 5] as const
 *      const bar = <[4, 5]>[4, 5]
 *
 * @param node - The node to check
 *
 * @returns True if the node has a type assertion
 */
export function isTypeAssertion(node: ts.Node): boolean {
    return ts.hasOnlyExpressionInitializer(node) && !!node.initializer &&
        (ts.isAsExpression(node.initializer) || ts.isTypeAssertionExpression(node));
}
