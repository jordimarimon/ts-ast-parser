TypeScript Abstract Syntax Tree Parser
=================

**NOTE: This is still a work in progress**

Simplifies the TypeScript AST generated from the TypeScript compiler to help extract helpful 
metadata from your source code.

This metadata then can be used to generate documentation for your source code.

Other libraries of interest are:

* [TypeScript Compiler](https://github.com/microsoft/TypeScript/tree/main/src/compiler)
* [Custom Element Manifest analyser](https://github.com/open-wc/custom-elements-manifest/tree/master/packages/analyzer)
* [ts-morph](https://github.com/dsherret/ts-morph/tree/latest/packages/ts-morph)
* [JSDoc](https://github.com/jsdoc/jsdoc)
* [JSDoc To Markdown](https://github.com/jsdoc2md/jsdoc-to-markdown)
* [Better docs](https://github.com/SoftwareBrothers/better-docs)
* [API Extractor](https://api-extractor.com/)
* [TSDoc](https://github.com/microsoft/tsdoc)
* [Type Doc](https://typedoc.org/)
* [DocFX](https://dotnet.github.io/docfx/)
* [TS Docs gen](https://github.com/SimplrJS/ts-docs-gen)
* [Node TypeScript Parser](https://github.com/buehler/node-typescript-parser)

A lot of the code written in this repository has been inspired/sourced from the above libraries and 
the TypeScript compiler source code.

Table of contents
=================

<!--ts-->
* [Install](#install)
  * [npm](#npm)
  * [yarn](#yarn)
  * [pnpm](#pnpm)
  * [Peer Dependencies](#peer-dependencies)
* [Documentation](#documentation)
* [Contributing](#contributing)
<!--te-->

Install
=================

### npm

    npm install <pkg-name>

### yarn

    yarn add <pkg-name>

### pnpm

    pnpm add <pkg-name>

### Peer Dependencies

Depends on `typescript`, so you need to manually install this as well.

Documentation
=================

[Check out the documentation website](https://jordimarimon.github.io/ts-ast-parser)

Contributing
=================

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
