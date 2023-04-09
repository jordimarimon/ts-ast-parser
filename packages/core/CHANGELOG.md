# [next]

**The library has been written again from scratch. Make sure to check the documentation website.**

### Bug Fixes

* Reflect imports with side effects (example: `import './foo.js'`)
* Imports with different kinds weren't reflected correctly (example: `import Foo, { bar } from './foo'`)

### 🚨 Breaking Changes

* The field `type` in the Imports and Exports nodes has been changed to `kind` for consistency with the same field in 
  the declaration node.
* Now all the fields `kind` (including the new one in the imports and exports) are capitalized.
* The functions `parseFromFiles` and `parseFromGlob` now return an array of instances of 
  `ModuleNode`. The function `parseFromSource` returns an instance of `ModuleNode`.
* The field `members` in the `Interface` and `Class` nodes has been split into `properties`, `staticProperties`, 
  `methods` and `staticMethods`. 
* The package `@ts-ast-parser/readers` has been deleted. There is no need for this packages as know all the 
  functionalities are already included in the package `@ts-ast-parser/core`.

# [0.2.0](https://github.com/jordimarimon/ts-ast-parser/compare/0.1.0...0.2.0) (2022-12-25)

### Bug Fixes

* Reflect star exports and namespace exports
* Support nested namespaces

### Features

* Add references to type definitions
* Support older versions of NodeJS. Now it is supported: `14.20`, `16.x` and `18.x`
* Support older version of TypeScript. Now it is supported: `4.7`, `4.8` and `4.9`. Older versions could be supported 
  in the future.

### 🚨 Breaking Changes

* The property `source` in a `type` has changed to `sources` and is an array instead of an object.
  This property represents all the type definitions that are involved in the type. A type may be composed of
  other types. Example of types that are composed of others are union types, intersection types, array type, etc...

# [0.1.0](https://github.com/jordimarimon/ts-ast-parser/compare/c3366eb7...0.1.0) (2022-11-05)

Release of the first version of the package
