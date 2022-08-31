<h1 style="text-align: center; border-bottom: none" align="center">
    <div>TypeScript Abstract Syntax Tree Parser</div>
    <br/>
    <div>🚨🚨 NOTE: This is still a work in progress 🚨🚨</div>
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

Simplifies the TypeScript AST generated from the TypeScript compiler to help extract helpful metadata.  

This metadata then can be used to generate documentation.

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
- Markdown **(coming soon)**

Also provides:

- Helper class for reading and searching in the metadata **(coming soon)**

## Packages

* [@ts-ast-parser/core](./packages/core)
* [@ts-ast-parser/to-markdown](./packages/to-markdown)

## Documentation

Documentation is available on the [website](https://jordimarimon.github.io/ts-ast-parser)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
