export interface Foo<K> {
    x: number;
    y?: string | K;
    bar: () => void;
    isBar: (a: number, b: string) => boolean;
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    checkBar(): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    barWithTypedParameter<T>(c: T): T;
    arrowFuncWithTypedParameters: <T>(c: T) => T;
}
