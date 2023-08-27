# Grammar

This document explains the grammar behind the parser. 

The grammar is based on [JSDoc 3](https://jsdoc.app/index.html) spec and [TSDoc](https://tsdoc.org/) spec.

Each comment must start with a `/**` sequence in order to be recognized by the 
parser. Comments beginning with `/*`, `/***`, or more than 3 stars will be ignored. This 
is a feature to allow you to suppress parsing of comment blocks.

Each comment must end with `*/`.

Special "JSDoc tags" can be used to give more information.

JSDoc supports two different kinds of tags:

- **Block tags**, which are at the top level of a JSDoc comment.
- **Inline tags**, which are within the text of a block tag or a description.

Block tags always begin with an at sign (`@`). Each block tag must be followed by a line break, 
with the exception of the last block tag in a JSDoc comment.

Inline tags also begin with an at sign. However, inline tags and their text must be enclosed 
in curly braces (`{` and `}`). The `{` denotes the start of the inline tag, and the `}` denotes 
the end of the inline tag. If your tag's text includes a closing curly brace (`}`), you must escape 
it with a leading backslash (`\`). You do not need to use a line break after inline tags.

When referring to a symbol or type that is elsewhere in your documentation, you must provide a unique identifier that 
maps to that symbol/type. A namepath provides a way to do so.

## Terminals

- Start of the input: `/**`
- End of the input: `*/`

## NonTerminals / Production rules
