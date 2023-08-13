// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function sleep(amount = 500) {
    await new Promise<void>(resolve => {
        setTimeout(() => resolve(), amount);
    });

    console.log('SLEEP FINISHED');
}
