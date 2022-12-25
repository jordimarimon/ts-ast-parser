<h1 style="text-align: center; border-bottom: none" align="center">
    <div>TypeScript Abstract Syntax Tree Parser</div>
</h1>

<br/>

<div style="text-align: center" align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=jordimarimon_ts-ast-parser&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=jordimarimon_ts-ast-parser)
[![codecov](https://codecov.io/gh/jordimarimon/ts-ast-parser/branch/main/graph/badge.svg?token=DMIFUI10V9)](https://codecov.io/gh/jordimarimon/ts-ast-parser)
[![Build and Test Workflow](https://github.com/jordimarimon/ts-ast-parser/actions/workflows/build.yml/badge.svg)](https://github.com/jordimarimon/ts-ast-parser/blob/main/.github/workflows/build.yml)

</div>

<br/>

<div style="text-align: center;" align="center">
  <a href="https://jordimarimon.github.io/ts-ast-parser">Website</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://jordimarimon.github.io/ts-ast-parser/playground/">Playground</a>
</div>

<br/>

## What it is

Simplifies the TypeScript AST generated from the TypeScript compiler for information that may be useful.

This information then can be used to generate documentation.

## Features

Extracts metadata from:

- Import declarations
- Export declarations
- Function declarations
- Variable declarations
- Interface declarations
- Type Alias declarations
- Enum declarations
- JSDoc
- Class declarations
- Decorators
- Inheritance
- Mixins **(coming soon)**
- Custom elements **(coming soon)**

Supported output formats:

- JSON

Also provides:

- Helper class for reading and searching in the metadata

## Projects in this monorepo

| Name                                         | Version                                                                                                                                    | Description                                                      |
|----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| [@ts-ast-parser/core](./packages/core)       | [![@ts-ast-parser/core](https://img.shields.io/npm/v/@ts-ast-parser/core.svg)](https://www.npmjs.com/package/@ts-ast-parser/core)          | Reads the TS Compiler AST and outputs a simplified version of it |
| [@ts-ast-parser/readers](./packages/readers) | [![@ts-ast-parser/readers](https://img.shields.io/npm/v/@ts-ast-parser/readers.svg)](https://www.npmjs.com/package/@ts-ast-parser/readers) | Helps to read and search the reflected AST.                      |

## Documentation

Documentation is available on the [website](https://jordimarimon.github.io/ts-ast-parser)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
