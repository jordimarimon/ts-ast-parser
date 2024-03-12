<h1 style="text-align: center; border-bottom: none" align="center">
    <div>TypeScript Abstract Syntax Tree Parser</div>
</h1>

<br/>

<div style="text-align: center" align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![Build and Test Workflow](https://github.com/jordimarimon/ts-ast-parser/actions/workflows/build.yml/badge.svg)](https://github.com/jordimarimon/ts-ast-parser/blob/main/.github/workflows/build.yml)

</div>

<br/>

<div style="text-align: center;" align="center">
  <a href="https://jordimarimon.github.io/ts-ast-parser">Website</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://jordimarimon.github.io/ts-ast-parser/playground/">Playground</a>
</div>

<br/>

> **Note**
> This project is still in beta until it reaches version 1.0.0. There could be breaking changes between minor versions.

## What it is

Reflects a simplified version of the TypeScript AST generated from the TypeScript compiler.

## Projects in this monorepo

| Name                                         | Version                                                                                                                                    | Description                                                       |
|----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| [@ts-ast-parser/core](./packages/core)       | [![@ts-ast-parser/core](https://img.shields.io/npm/v/@ts-ast-parser/core.svg)](https://www.npmjs.com/package/@ts-ast-parser/core)          | Reads the TS Compiler AST and reflects a simplified version of it |
| [@ts-ast-parser/comment](./packages/comment) | [![@ts-ast-parser/comment](https://img.shields.io/npm/v/@ts-ast-parser/comment.svg)](https://www.npmjs.com/package/@ts-ast-parser/comment) | Parses comments that follow the JSDoc or TSDoc standard           |

## Documentation

Documentation is available on the [website](https://jordimarimon.github.io/ts-ast-parser)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
