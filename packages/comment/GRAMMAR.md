# Grammar

This document explains the formal grammar that is able to generate a documentation comment.

The grammar is inspired on the [JSDoc 3](https://jsdoc.app/index.html) spec and the [TSDoc](https://tsdoc.org/) spec.

[EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) will be used to describe the grammar.

## Introduction

Each comment must start with a `/**` sequence in order to be recognized by the 
parser. Comments beginning with `/*`, `/***`, or more than 3 stars will be ignored. This 
is a feature that allows to suppress parsing of comment blocks.

Each comment must end with `*/`.

Special "tags" can be used to give more information.

Tag names start with an at-sign (@) followed by ASCII letters using "camelCase" capitalization.

There is support for two different kinds of tags:

- **Block tags**, which are at the top level of a comment.
- **Inline tags**, which are within the text of a block tag or a description.

Any content appearing prior to the first block tag is interpreted as the special "summary" or "description" section.

Each block tag must be followed by a line break, except the last block tag in a comment.

All text following a block tag, up until the start of the next block tag, is considered to be the 
block tag's tag content. The content may include Markdown elements and inline tags.

Inline tags and their text must be enclosed in curly braces (`{` and `}`). The `{` denotes the start 
of the inline tag, and the `}` denotes the end of the inline tag. If your tag's text includes a 
closing curly brace (`}`), you must escape it with a leading backslash (`\`). You do not need to 
use a line break after inline tags.

When referring to a symbol or type that is elsewhere in your documentation, you must provide a unique identifier that 
maps to that symbol/type. A namepath provides a way to do so.

To read more information about the syntax that a namepath should follow, you can read it in the 
[JSDoc 3 Namepath](https://jsdoc.app/about-namepaths.html) and in the [TSDoc @link](https://tsdoc.org/pages/tags/link/).

## Spec

To refer to terminals, pascal case (upper camel case) will be used.

To refer to non-terminals snake case (with all uppercase letters) will be used.

### Terminals

```ebnf
NewLine             ::= ‘\n‘ | ‘\r\n‘

Space               ::= ‘\t‘ | ‘\f‘ | ‘ ‘

Spaces              ::= Space | Spaces Space

AsciiCharacter      ::= ‘a‘ | ‘b‘ | ‘c‘ | ‘d‘ | ‘e‘ | ‘f‘ | ‘g‘ | ‘h‘ | ‘i‘
                        ‘j‘ | ‘k‘ | ‘l‘ | ‘m‘ | ‘n‘ | ‘o‘ | ‘p‘ | ‘q‘ | ‘r‘
                        ‘s‘ | ‘t‘ | ‘u‘ | ‘v‘ | ‘w‘ | ‘x‘ | ‘y‘ | ‘z‘ | ‘A‘
                        ‘B‘ | ‘C‘ | ‘D‘ | ‘E‘ | ‘F‘ | ‘G‘ | ‘H‘ | ‘I‘ | ‘J‘
                        ‘K‘ | ‘L‘ | ‘M‘ | ‘N‘ | ‘O‘ | ‘P‘ | ‘Q‘ | ‘R‘ | ‘S‘
                        ‘T‘ | ‘U‘ | ‘V‘ | ‘W‘ | ‘X‘ | ‘Y‘ | ‘Z‘ | ‘0‘ | ‘1‘
                        ‘2‘ | ‘3‘ | ‘4‘ | ‘5‘ | ‘6‘ | ‘7‘ | ‘8‘ | ‘9‘ | ‘_‘

AsciiWord           ::= AsciiCharacter | AsciiCharacter AsciiWord

Star                ::= ‘*‘

Slash               ::= ‘/‘

Backslash           ::= ‘\‘

DoubleQuote         ::= ‘"‘

Tilde               ::= ‘~‘

AtSign              ::= ‘@‘

LeftCurly           ::= ‘{‘

RightCurly          ::= ‘}‘

Backtick            ::= ‘`‘

Period              ::= ‘.‘

Colon               ::= ‘:‘

Pipe                ::= ‘|‘

PoundSymbol         ::= ‘#‘

Equal               ::= ‘=‘

LeftSquare          ::= ‘[‘

RightSquare         ::= ‘]‘

Hyphen              ::= ‘-‘

Other               ::= (* Any other character not present in the above terminals *)
```

### Non-terminals

```ebnf
COMMENT             ::= START_OF_INPUT [ DESCRIPTION_LINE ] [ BLOCK_TAGS_LINES ] [ Space ] END_OF_INPUT

START_OF_INPUT      ::= Slash Star Star

END_OF_INPUT        ::= Start Slash

START_OF_LINE       ::= Space Star Spaces

DESCRIPTION_LINE    ::= START_OF_LINE DESCRIPTION [ NEW_LINE ]

DESCRIPTION         ::= (* Any character is accepted if it's correctly escaped. Also inline tags are accepted. *)

BLOCK_TAGS          ::= BLOCK_TAG | BLOCK_TAG BLOCK_TAGS

BLOCK_TAG           ::= START_OF_LINE AtSign AsciiWord [ Spaces BLOCK_TAG_TYPE ] [ Spaces BLOCK_TAG_NAME ] [ Spaces [ Hyphen Spaces ] DESCRIPTION ]

BLOCK_TAG_TYPE      ::= LeftCurly AsciiWord RightCurly

BLOCK_TAG_NAME      ::= AsciiWord | LeftSquare AsciiWord [ Equal AsciiWord ] RightSquare

INLINE_TAG          ::= LeftCurly AtSign AsciiWord Space NAMEPATH_OR_URL [ LINK_TEXT ] RightCurly
                    |  LeftSquare LINK_TEXT RightSquare LeftCurly AtSign LINK_NAME Space NAMEPATH_OR_URL RightCurly

LINK_TEXT           ::= [ Space ] Pipe [ Space ] (* Any character is accepted. Make sure to escape especial characters. *)

NAMEPATH_OR_URL     ::= NAMEPATH | URL

URL                 ::= (* Any character is accepted. Make sure to escape especial characters. *)

NAMEPATH            ::= NAMEPATH Period NAMEPATH
                    | NAMEPATH PoundSymbol NAMEPATH
                    | NAMEPATH Colon NAMEPATH
                    | NAMEPATH Tilde NAMEPATH
                    | (* Any character is accepted. Make sure to escape especial characters. *)
```


