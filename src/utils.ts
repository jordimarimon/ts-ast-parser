import ts from 'typescript';

/**
 * Returns true if the array is not empty
 */
export const isNotEmptyArray = (arr: unknown): boolean => Array.isArray(arr) && arr.length > 0;

/**
 * Returns true if the class member (property or method) is static
 */
export const isStaticMember = (member: ts.PropertyDeclaration): boolean => {
    return !!member?.modifiers?.some?.(x => x.kind === ts.SyntaxKind.StaticKeyword);
};

/**
 * Checks whether a variable declaration is also it's initialization
 */
export function hasInitializer(node: ts.VariableStatement): boolean {
    return node?.declarationList?.declarations?.some(declaration => declaration?.initializer);
}

/**
 * Checks whether the imported module only specifies its module in the import path,
 * rather than the full or relative path to where it's located:
 *
 *      import lodash from 'lodash'; --> Correct
 *      import foo from './foo.js'; --> Incorrect
 */
export function isBareModuleSpecifier(specifier: string): boolean {
    return !!specifier?.replace(/'/g, '')[0].match(/[@a-zA-Z\d]/g);
}
