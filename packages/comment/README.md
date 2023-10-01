# @ts-ast-parser/comment

General purpose parser for documentation comments that tries to follow as much as possible the 
[JSDoc 3](https://jsdoc.app/) spec and the [TSDoc](https://tsdoc.org/) spec.

### Install

```shell
npm i @ts-ast-parser/comment
```

## Usage

```ts
import { parse } from '@ts-ast-parser/comment';

const comment = `/** This is a simple description */`;
const parserResult = parse(comment);

if (parserResult.error) {
    // Handle the errors accordingly
    process.exit(1);
}

// This is an array of `CommentPart`
const parts = parserResult.parts;

// This would log "This is a simple description"
console.log(parts.find(p => p.kind === 'description')?.text ?? '');
```
