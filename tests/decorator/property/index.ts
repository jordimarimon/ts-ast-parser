function min(limit: number): (target: object, propertyKey: string) => void {
    return (target: object, propertyKey: string) => {
        let value: string;

        const getter = () => value;

        const setter = (newVal: string): void => {
            if (newVal.length < limit) {
                return;
            }

            value = newVal;
        };

        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
        });
    };
}

export class User {
    username: string;

    @min(8)
        password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}
