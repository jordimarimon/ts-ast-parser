import { Person } from '@test-project/a';


export class Employee extends Person {
    salary: number;

    constructor(name: string, age: number, salary: number) {
        super(name, age);

        this.salary = salary;
    }
}
