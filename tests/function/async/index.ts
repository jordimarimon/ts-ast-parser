export async function sleep(amount = 500) {
    await new Promise<void>(resolve => {
        setTimeout(() => resolve(), amount);
    });

    console.log('SLEEP FINISHED');
}
