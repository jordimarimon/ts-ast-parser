export type TypeX<T> = {
    fieldInType: T;
};

export interface TypeY<T> {
    fieldInInterface: T;
}

export class ClassB<T = unknown> {
    fieldInB?: T;

    set setterInB(a: T) {
        this.fieldInB = a;
    }

    constructor(value: T) {
        this.fieldInB = value;
    }

    myFunction(a: T): T {
        return a;
    }
}

export class ClassA extends ClassB<string> {
    interfaceField?: TypeY<string>;

    typeField?: TypeX<string>;
}
