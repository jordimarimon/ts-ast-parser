export interface Pingable {
    ping(): void;
}

export class Sonar implements Pingable {
    ping() {
        console.log("ping!");
    }
}
