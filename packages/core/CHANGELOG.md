## [next]

### Bug Fixes

- Correctly reflect import specifiers that are type only. Before only import clauses where checked for type only and
  import specifiers were ignored. Something like `import type { Foo } from './foo.js'` was correctly reflected as 
  type only, but if instead we had `import { type Foo } from './foo.js'`, this wasn't reflected as type only.

# 0.6.1 (2023-10-01)

### Bug Fixes

- Remove the extra spaces in the start of each line in the JSDoc comments

# 0.6.0 (2023-10-01)

### Bug Fixes

- Create `require` function for Node environments where it's not available by default 

### Features

- Reflect module level JSDoc comments
- Reflect inline tags in JSDoc comments

### 🚨 Breaking Changes

A JSDoc parser has been implemented from scratch to be able to reflect comments that 
follow the JSDoc or TSDoc spec.

This means that there are breaking changes on how JSDoc comments are reflected.

For example:

```ts
/**
 * This is the description. To see more information go to {@link https://www.example.com | Example}
 * 
 * @param {Boolean} [param1=false] - Description of param1. To see more information go 
 * to {@link https://www.google.com | Google}
 * @param param2 - Description of param2
 */
```

Before, the above comment, was reflected like this:

```json
{
    "jsDoc": [
        {
            "kind": "description",
            "value": "This is the description. To see more information go to {@link https://www.example.com | Example}"
        },
        {
            "kind": "param",
            "value": {
                "default": "false",
                "optional": true,
                "type": "Boolean",
                "name": "param1",
                "description": "Description of param1. To see more information go \nto {@link https://www.google.com | Google}"
            }
        },
        {
            "kind": "param",
            "value": {
                "name": "param2",
                "description": "Description of param2"
            }
        }
    ]
}
```

Now it gets reflected like this:

```json
{
    "jsDoc": [
        {
            "kind": "description",
            "text": [
                {
                    "kind": "text",
                    "text": "This is the description. To see more information go to"
                },
                {
                    "kind": "link",
                    "target": "https://www.example.com",
                    "targetText": "Example"
                }
            ]
        },
        {
            "kind": "param",
            "name": "param1",
            "text": [
                {
                    "kind": "text",
                    "text": "Description of param1. To see more information go\nto"
                },
                {
                    "kind": "link",
                    "target": "https://www.google.com",
                    "targetText": "Google"
                }
            ],
            "type": "Boolean",
            "optional": true,
            "default": "false"
        },
        {
            "kind": "param",
            "name": "param2",
            "text": "Description of param2"
        }
    ]
}
```

Basically the changes are the following ones:

- The JSDoc `description` field has been renamed to `text`
- The renamed JSDoc field `text` can be a `string` or an array depending on if it has inline tags or not.

# 0.5.0 (2023-08-16)

### Bug Fixes

- Use `/` as the base path when parsing the command line options in an in-memory file system
- Add missing exports

### Features

- The reflected information about the constraint in a type parameter has been improved
- The information that gets reflected about types has been improved
- The type arguments in the types inside a heritage clause are reflected
- The `AnalyserResult` contains also the errors formatted in case it's needed to show them in a UI
- You can add new files in a project after the analysis (using the `Project` API)
- You can update the entire contents of an existing file after the analysis (using the `Project` API)

### 🚨 Breaking Changes

- The return type of all the `parseFrom*` functions has been updated. It now returns the following:
  ```ts
  interface AnalyserResult {
    project: Project | null;
    errors: AnalyserError[];
    formattedDiagnostics?: string;
  }
  ```

- Now in a `ParameterNode` when calling the method `getNamedElements()` it will return an array of `BindingElementNode[]`
  instead of an array of `NamedParameterElement[]`. This change has been done for consistency with the rest of the 
  library.

# 0.4.0 (2023-08-11)

### Features

- Reflect the output JS path of a given source file. Use the `getOuputPath()` method from the `ModuleNode` class.
- Analyse an entire project with the new function `parseFromProject()`.
- Skip the semantic diagnostic check with the `boolean` option `skipDiagnostics`.
- Be able to use any `parseFrom*` function inside the browser.
- Reflect more information about types.

### Bug Fixes

- Don't remove reexport nodes when searching for duplicate exports.

### 🚨 Breaking Changes

- The field `path` of a module has been renamed to `sourcePath`. This renaming is needed because now there is also
    available the `outputPath` field (the path where the JS file gets compiled).
- All `parserFrom*` functions, now receive as second argument an object of type `AnalyserOptions` instead of
    the `ts.CompilerOptions`.
- All `parserFrom*` functions are now asynchronous and will return a promise.
- The reflection object of a type has changed
- All `parserFrom*` functions now return an `AnalyserResult<T>` object

## 0.3.1 (2023-06-18)

### Bug Fixes

- Add `chalk` as a dependency in the `package.json`

# 0.3.0 (2023-06-18)

**The library has been rewritten from scratch.**

If you want to still use the old behaviour, you can by calling the `serialize` method in the reflected module node:

```typescript
import { ModuleNode, Module } from '@ts-ast-parser/core';

///////////////
// BEFORE
///////////////

const beforeReflectedNodes: Module[] = parseFromFiles(['...']);

////////////////
// AFTER
///////////////

// Same applies for `parseFromGlob`
const afterReflectedNodes: ModuleNode[] = parseFromFiles(['...']);
// const afterReflectedNode: ModuleNode = parseFromSource(`....`);

// Converts the array of `ModuleNode` to `Module`.
// A `Module` is a plain old javascript object without methods, only read-only properties.
const serializedNodes: Module[] = afterReflectedNodes.map(node => node.serialize());
```

Make sure to check what a [`ModuleNode`](./src/nodes/module-node.ts) is before working with it.

Be aware of the breaking changes listed below.

### Features

- The constraints defined in a type parameter will be reflected.
- TypeScript versions `5.0` and `5.1` are supported

### Bug Fixes

- Reflect imports with side effects (example: `import './foo.js'`).
- Imports with different kinds weren't reflected correctly (example: `import Foo, { bar } from './foo'`).
- The type and name of a parameter in an index signature wasn't being reflected correctly.
- Getters and Setters (property accessors) were not being reflected when defined inside an interface.
- Class expressions used as initializers in variable declarations weren't being reflected.

### 🚨 Breaking Changes

- The field `type` in the Imports and Exports nodes has been renamed to `kind` for consistency with the same field in
    the declaration node.
- Now all the fields `kind` (including the new one in the imports and exports) are capitalized.
- The functions `parseFromFiles` and `parseFromGlob` now return an array of instances of `ModuleNode`.
- The function `parseFromSource` returns an instance of `ModuleNode`.
- The field `members` in the `Interface` and `Class` nodes has been split into `properties`, `staticProperties`,
    `methods` and `staticMethods`.
- The package `@ts-ast-parser/readers` has been deleted. There is no need for this packages as now all the
    functionalities are already included in the package `@ts-ast-parser/core`.
- The field `value` in a `NamedParameter` has been renamed to `default`.
- The field `isTypeOnly` in imports and exports has been renamed to `typeOnly`
- The field `isBareModuleSpecifier` in imports has been renamed to `bareModuleSpecifier`
- Drop support for Node `14.x`
- Drop support for CommonJS

# 0.2.0 (2022-12-25)

### Bug Fixes

- Reflect star exports and namespace exports
- Support nested namespaces

### Features

- Add references to type definitions
- Support older versions of Node.js. Now it is supported: `14.20`, `16.x` and `18.x`
- Support older version of TypeScript. Now it is supported: `4.7`, `4.8` and `4.9`. Older versions could be supported
    in the future.

### 🚨 Breaking Changes

- The property `source` in a `type` has changed to `sources` and is an array instead of an object.
    This property represents all the type definitions that are involved in the type. A type may be composed of
    other types. Example of types that are composed of others are union types, intersection types, array type, etc...

# 0.1.0 (2022-11-05)

Release of the first version of the package
