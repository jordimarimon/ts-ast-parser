import { Person } from '@test-project/a';
export class Employee extends Person {
    salary;
    constructor(name, age, salary) {
        super(name, age);
        this.salary = salary;
    }
}
