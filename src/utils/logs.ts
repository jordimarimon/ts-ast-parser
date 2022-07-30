import chalk from 'chalk';

//
// The following functions are used to log messages to console
//

const LIB_PREFIX = '[TS AST PARSER]';


export function logWarning(message: string): void {
    console.warn(chalk.yellow(`${LIB_PREFIX}: ${message}`));
}

export function logError(message: string, error?: unknown): void {
    console.error(chalk.red(`${LIB_PREFIX}: ${message}`));

    if (error != null) {
        console.error(error);
    }
}

export function logInfo(message: string): void {
    console.info(chalk.blue(`${LIB_PREFIX}: ${message}`));
}
