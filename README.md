less-import-inserter
====================

[![NPM](https://nodei.co/npm/less-import-inserter.png)](https://nodei.co/npm/less-import-inserter/)
[![Build Status](https://travis-ci.org/lukekarrys/less-import-inserter.png?branch=master)](https://travis-ci.org/lukekarrys/less-import-inserter)

Insert some import statements into an existing Less file.

I mainly created this because I wanted to insert my own variables into Bootstrap's main Less file to override some of the default variables. I found this to be the easiest way to do that in situations where I wanted to quickly be able to play around with editing things like `@grid-columns` and `@grid-gutter-width` while starting to develop a site or theme.

## Install

`npm install less-import-inserter`


## Usage

```js
var less = new LessImportInserter({
    // Path to the less file to alter
    lessPath: path.join(__dirname, 'node_modules/bootstrap/less/bootstrap.less'),
    // Change the original bootstrap imports to be relative from this path
    relativeTo: __dirname,
    after: {
        'variables.less': 'styles/override-variables.less'
    },
    append: 'styles/app.less'
}).build();
console.log(less);
```

This will take the `bootstrap.less` file found at the path, and insert an `@import` statement **after** the `variables.less` `@import`. It will also **append** an `@import` to the end of the file. The end result will look like this:

```less
// Core variables and mixins
@import "node_modules/bootstrap/less/variables.less";
@import "styles/override-variables.less";
@import "node_modules/bootstrap/less/mixins.less";

// Other Bootstrap @imports...

@import "styles/app.less";
```

## API

### methods

#### `build`

Returns the less file with the added `@import` statements.


### options

`new LessImportInserter(options)`

#### `options.lessPath` (required)

The path to the less file that you want to be read and then insert `@import` statements into.

#### `options.less` (optional, String)

If you don't want to pass in a path to a less file, you can pass in raw Less using this option.

#### `options.relativeTo` (optional, String)

Allows you to rewrite all the existing `@import`s to be relative to this path from the directory of `lessPath`. Using this option you can write the resulting output to this path and all the `@import`s will work.

#### `options.before` (Object)
#### `options.after` (Object)

Each object will insert the values either before or after the specified key. The key will be searched for in all the existing `@import` statements so it can be any part of the path. The values can either be a `String` or an `Array` of strings. Here's an example:

```js
{
    before: {
        'utilities.less': 'styles/my-utilities.less'
    },
    after: {
        'variables.less': [
            'styles/my-variables.less',
            'styles/app/my-theme.less'
        ],
        'mixins.less': 'styles/my-mixins.less'
    }
}
```

This will do the following:

- Before the `utilities.less` import, insert an import for `styles/my-utilities.less`
- After the `variables.less` import, insert imports for `styles/my-variables.less` and `styles/app/my-theme.less`
- After the `mixins.less` import, insert an import for `styles/my-mixins.less`

So the file will be changed to look like this:

**previous**
```less
@import "old-theme/variables.less";
@import "plugin/mixins.less";
@import "components.less";
@import "utilities.less";
```

**result**
```less
@import "old-theme/variables.less";
@import "styles/my-variables.less";
@import "styles/app/my-theme.less";
@import "plugin/mixins.less";
@import "styles/my-mixins.less";
@import "components.less";
@import "styles/my-utilities.less";
@import "utilities.less";
```

#### `options.append` (String or Array)

These work the same way as the values for `before` or `after` except that they will be added to the end of the file instead of before or after an existing `@import`.


## Other Less tools

Check out [`lessitizer`](https://www.npmjs.org/package/lessitizer) which will take the resulting less from this an an input and create the css and write it to a file.


## Tests and Code Coverage

Run `npm test`.


## License

MIT

