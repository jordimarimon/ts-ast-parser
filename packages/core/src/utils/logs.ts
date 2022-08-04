import chalk from 'chalk';

//
// The following functions are used to log messages to console
//

const LIB_PREFIX = '[TS AST PARSER]';


export function logWarning(message: string, payload?: unknown): void {
    console.log(chalk.yellow(`${LIB_PREFIX}: ${message}`));

    if (payload != null) {
        console.warn(payload);
    }
}

export function logError(message: string, payload?: unknown): void {
    console.log(chalk.red(`${LIB_PREFIX}: ${message}`));

    if (payload != null) {
        console.error(payload);
    }
}

export function logInfo(message: string): void {
    console.log(chalk.blue(`${LIB_PREFIX}: ${message}`));
}
