export class Person {
    name: string;

    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}

export class Employee extends Person {
    salary: number;

    constructor(name: string, age: number, salary: number) {
        super(name, age);

        this.salary = salary;
    }
}
