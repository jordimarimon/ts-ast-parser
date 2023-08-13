// @ts-expect-error TS is not able to resolve the declaration files
import { Person } from '@test-project/a';


export declare class Employee extends Person {
    salary: number;
    constructor(name: string, age: number, salary: number);
}
