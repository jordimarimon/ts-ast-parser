export type ArrayType = string[];
export type ConditionalType<T> = T extends boolean ? 1 : 0;
export type IndexedAccessType = ArrayType[number];
export type ObjectLiteralType = { age: number; name: string; alive: boolean };
export type IndexedAccessType2 = ObjectLiteralType['age'];
export type InferredType = Promise<string> extends Promise<infer U> ? U : never;
export type IntrinsicType = string;
export type IntersectionType = IntrinsicType & number;
export type UnionType = string | string[];
export type LiteralType = 0;
export type MappedType<T> = { [Property in keyof T]: boolean; };
export type OptionalType = [1, 2?];
export function typePredicateFunction(condition: boolean): asserts condition {
    if (!condition) {
        throw new Error('Condition not met');
    }
}
export const x = 1;
export type QueryType = typeof x;
export type ReferenceType = ConditionalType<string>;
export type RestType = [1, ...2[]];
export type TemplateLiteralType = `${'a' | 'b'}${'a' | 'b'}`;
export type TupleType = [string, boolean];
export type NamedTupleMembers = [name: string];
export type TypeOperator = readonly number[];
