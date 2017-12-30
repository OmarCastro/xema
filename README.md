Xema
-------------

 A schema validator with value type checking and data generation 

[![npm](https://img.shields.io/npm/v/xema.svg?style=flat-square)](https://www.npmjs.com/package/xema)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/travis/OmarCastro/xema/master.svg?style=flat-square)](https://travis-ci.org/OmarCastro/xema)
[![Code Coverage](https://img.shields.io/codecov/c/github/OmarCastro/xema.svg?style=flat-square)](https://codecov.io/gh/OmarCastro/xema)

#### Features

Defining a schema:
```Javascript
const xema = require('xema');
 //Create a string schema with that validates initial text
const loremSchema = xema.string.startsWith('Lorem');

loremSchema.validate('Lorem ipsum'); // {} 
```

Values that fails on schema validation contains information about the failure
```Javascript
loremSchema.validate('invalid text'); // {error: 'string = "invalid text" does not start with "Lorem"'}
```

All schemas are immutable, so every rule added to a schema creates a new one
```Javascript
const loremIpsumSchema = loremSchema.endsWith('ipsum');
loremSchema.validate('Lorem ipsum dolor sit amet'); // {} 
loremIpsumSchema.validate('Lorem ipsum dolor sit amet'); // {error: 'string = "Lorem ipsum dolor sit ame" does not end with "ipsum"'}
```

Schemas do not allow null values by default, to allow them the optional rule must be called
```Javascript
const optionalLoremIpsumSchema = loremIpsumSchema.optional();
optionalLoremIpsumSchema.validate(null)  // {}
optionalLoremIpsumSchema.validate(undefined)  // {}
loremIpsumSchema.validate(null) // {error: 'value = null is not a string'}
loremIpsumSchema.validate(undefined) // {error: 'value = undefined is not a string'}
```
