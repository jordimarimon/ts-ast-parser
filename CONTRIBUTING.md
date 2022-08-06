# Contributing

For a better understanding, it's recommended to play around with some AST viewer: 

- [TypeScript AST Viewer](https://ts-ast-viewer.com)
- [AST Explorer](https://astexplorer.net/)

Also, it may help to understand how the TypeScript compiler works:

* [TypeScript Compiler Source Code](https://github.com/microsoft/TypeScript/tree/main/src/compiler)
* [TypeScript Compiler Internals](https://basarat.gitbook.io/typescript/overview)
* [TypeScript Compiler Notes](https://github.com/microsoft/TypeScript-Compiler-Notes)

## Filing Issues

TODO

## Pull Requests

TODO

## Code Style

TODO 

## Set up

    git clone https://github.com/jordimarimon/ts-ast-parser.git
    cd ts-ast-parser
    npm i
    npm run build

### Running tests

To run all the tests:

    npm run test

You can optionally specify the path of a test file.

    npm run test -- <test-file-path>

Example:

    npm run test -- variable/basic/test.ts

will execute only the test file located at `packages/core/tests/variable/basic/test.ts`.
