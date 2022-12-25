import { Type, TypeReference } from '../models/index.js';
import { tryAddProperty } from './try-add-property.js';
import { getLocation } from './get-location.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function getTypeInfoFromTsType(type: ts.Type | undefined): Type {
    if (type) {
        const checker = Context.checker;
        const name = checker?.typeToString(type) ?? '';
        const result: Type = {text: name};

        tryAddProperty(result, 'sources', getTypeDefinitions(type));

        return result;
    }

    return {text: ''};
}

export function getTypeDefinitions(type: ts.Type | undefined): TypeReference[] {
    if (!type) {
        return [];
    }

    const checker = Context.checker;
    const node = checker?.typeToTypeNode(type, void 0, ts.NodeBuilderFlags.IgnoreErrors);

    let result: TypeReference[] = [];

    if (!node) {
        return [];
    }

    // CASE of => TypeX[]
    if (ts.isArrayTypeNode(node) && ts.isTypeReferenceNode(node.elementType)) {
        const elementType = getTypeDefinitions(checker?.getTypeArguments(type as ts.TypeReference)?.[0]);
        result = result.concat(elementType);
    }

    // CASE of an Intersection type => TypeX & TypeY
    else if (ts.isIntersectionTypeNode(node)) {
        const elementTypes = (type as ts.IntersectionType).types.flatMap(t => getTypeDefinitions(t));
        result = result.concat(elementTypes);
    }

    // CASE of a Union type => TypeX | TypeY
    else if (ts.isUnionTypeNode(node)) {
        const elementTypes = (type as ts.UnionType).types.flatMap(t => getTypeDefinitions(t));
        result = result.concat(elementTypes);
    }

    // CASE of => TypeX
    else if (ts.isTypeReferenceNode(node)) {
        const name = checker?.typeToString(type) ?? '';
        const {path, line} = getLocation(type);

        if (line && path) {
            result.push({text: name, path, line});
        }
    }

    return result;
}

export function getTypeInfoFromNode(node: ts.Node): Type {
    const type = getType(node);

    return getTypeInfoFromTsType(type);
}

export function getType(node: ts.Node): ts.Type | undefined {
    const checker = Context.checker;
    const type = checker?.getTypeAtLocation(node);

    // Don't generalize the type of declarations like "const x = [4, 5] as const"
    if (isExplicitTypeSet(node)) {
        return type;
    }

    // Don't use the inferred literal types like "const x = 4" gives "x: 4" instead of "x: number"
    return type && checker?.getBaseTypeOfLiteralType(type);
}

export function isExplicitTypeSet(node: ts.Node): boolean {
    return ts.hasOnlyExpressionInitializer(node) && !!node.initializer &&
        (ts.isAsExpression(node.initializer) || ts.isTypeAssertionExpression(node));
}
