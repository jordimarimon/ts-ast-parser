export interface Foo<K> {
    x: number;
    y?: string | K;
    bar: () => void;
    isBar: (a: number, b: string) => boolean;
    checkBar(): Promise<void>;
    barWithTypedParameter<T>(c: T): T;
    arrowFuncWithTypedParameters: <T>(c: T) => T;
    readonly z: number;
}
