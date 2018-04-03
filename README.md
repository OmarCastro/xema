
<img src="https://cdn.rawgit.com/OmarCastro/xema/master/icon.svg" height=40></img>ema
-------------

A schema validator with subset check and data generation 

[![npm](https://img.shields.io/npm/v/xema.svg?style=flat-square)](https://www.npmjs.com/package/xema)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/travis/OmarCastro/xema/master.svg?style=flat-square)](https://travis-ci.org/OmarCastro/xema)
[![Code Coverage](https://img.shields.io/codecov/c/github/OmarCastro/xema.svg?style=flat-square)](https://codecov.io/gh/OmarCastro/xema)

#### Getting Started

Install with npm:
```Bash
npm install xema
```

#### Features

 - Subset check
 - Data generation
 - Typescript definition included
 - Schema validation checking


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

All schemas are immutable, so every rule added to a schema creates a new one.
```Javascript
const loremIpsumSchema = loremSchema.endsWith('ipsum');
loremSchema.validate('Lorem ipsum dolor sit amet'); // {} 
loremIpsumSchema.validate('Lorem ipsum dolor sit amet'); // {error: 'string = "Lorem ipsum dolor sit ame" does not end with "ipsum"'}
```

Schemas do not allow null values by default, to allow them the optional rule must be called.
```Javascript
const optionalLoremIpsumSchema = loremIpsumSchema.optional();
optionalLoremIpsumSchema.validate(null); // {}
optionalLoremIpsumSchema.validate(undefined);  // {}
loremIpsumSchema.validate(null); // {error: 'value = null is not a string'}
loremIpsumSchema.validate(undefined); // {error: 'value = undefined is not a string'}
```


You can check if a schema is a subset of another schema, this feature can be used for type checking. 

> A schema is a subset of another schema if all values that respects the subset schema respects the superset schema.

The following code shows the schema subset check usage
```Javascript
const optionalLoremIpsumSchema = loremIpsumSchema.optional();
xema.string.isSubsetOf(xema.string); // {isSubset: true}
xema.number.isSubsetOf(xema.number.optional()); // {isSubset: true}
xema.string.checkSubsetOf(xema.boolean); // {isSubset: false, reason: 'StringSchema cannot be a subset of BooleanSchema'}
```

There are two ways to generate data: sequential and random.

You can generate sequential data only on string, number and boolean schemas.
```Javascript
var generatedNumbers = xema.number.integer().min(1).generateSequentialData({maxAmount: 10000}); // generatedNumbers is a generator

//logs 1 to 10000
for( let num of generatedNumbers ){
 console.log(num);
}
```

You can generate random data on any schema.
```Javascript
var generatedRandomNumbers = xema.number.integer().min(1).generateRandomData({maxAmount: 10000}); // generatedRandomNumbers is a generator
//logs any positive integer greater than 0, 10000 times
for( let num of generatedRandomNumbers ){
 console.log(num);
}
```