# [0.2.0](https://github.com/jordimarimon/ts-ast-parser/compare/0.1.0...0.2.0) (2022-12-25)

### Bug Fixes

* Analyse star exports and namespace exports
* Support nested namespaces

### Features

* Add references to type definitions
* Support older versions of NodeJS. Now it is supported: `14.20`, `16.x` and `18.x`
* Support older version of TypeScript. Now it is supported: `4.7`, `4.8` and `4.9`. Older versions could be supported 
  in the future.

### Breaking Changes

* The property `source` in a `type` has changed to `sources` and is an array instead of an object.
  This property represents all the type definitions that are involved in the type. A type may be composed of
  other types. Example of types that are composed of others are union types, intersection types, array type, etc...

# [0.1.0](https://github.com/jordimarimon/ts-ast-parser/compare/c3366eb7...0.1.0) (2022-11-05)

Release of the first version of the package
