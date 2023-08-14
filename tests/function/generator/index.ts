export function* foo() {
    if (Math.random() < 0.5) {
        yield 100;
    }

    return 'Finished!';
}
