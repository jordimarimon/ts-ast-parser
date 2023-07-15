function log(_target: object, propertyKey: string, parameterIndex: number): void {
    console.log(`Decorating param ${parameterIndex} from ${propertyKey}`);
}

export class Task {

    run(@log name: string): void {
        console.log('running task, name: ', name);
    }

}
