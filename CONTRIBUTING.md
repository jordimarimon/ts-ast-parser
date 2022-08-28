# Contributing

Recommended resources to look at:

- [TypeScript AST Viewer](https://ts-ast-viewer.com)
- [AST Explorer](https://astexplorer.net/)
- [TypeScript Compiler Source Code](https://github.com/microsoft/TypeScript/tree/main/src/compiler)
- [TypeScript Compiler Internals](https://basarat.gitbook.io/typescript/overview)
- [TypeScript Compiler Notes](https://github.com/microsoft/TypeScript-Compiler-Notes)

## Filing Issues

Please search though open and closed issues to see if a similar issue already exists. If not, open an 
issue and try to provide a minimal reproduction if you can.

## Pull Requests

Pull requests are greatly appreciated!

Please follow these steps:

1. Make sure there's an open issue that the PR addresses.
2. All PRs that change behavior or fix bugs should have new or updated tests.
3. Try to create a set of descriptive commits that each do one focused change. 
4. Follow the [conventional commit specification](https://www.conventionalcommits.org/en/v1.0.0/) as this is the one being used.
5. When addressing review comments, try to add new commits, rather than modifying previous commits.

## Set up

    git clone https://github.com/jordimarimon/ts-ast-parser.git
    cd ts-ast-parser
    npm i
    npm run build

### Running tests

To run all the tests:

    npm run test

You can optionally specify the path (or part of it) from where to search and execute test files:

    npm run test -- <test-file-path>

The following example will execute all the tests in package `core`:

    npm run test -- core

Or maybe you want to execute all tests related to functions in the package `core`:

    # Executes all test files in "packages/core/tests/function"
    npm run test -- function
