import { parseFromGlob } from '@ts-ast-parser/core';
import { Reader } from '@ts-ast-parser/readers';


// TODO(Jordi M.): Generate the API reference for the documentation website

const coreMetadata = parseFromGlob('packages/core/src/**/*.ts');
const readersMetadata = parseFromGlob('packages/readers/src/**/*.ts');

function createApiReference(metadata) {
    const reader = new Reader(metadata);
}

createApiReference(coreMetadata);

createApiReference(readersMetadata);
