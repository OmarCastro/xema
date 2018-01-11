const string = require('../..').string
const should = require('chai').should()

describe('testing string validation', () => {
  it('should show error when validating null values', () => string.validate(null).error.should.eq('value = null is not a string'))
  it('should show error when validating undefined values', () => string.validate(undefined).error.should.eq('value = undefined is not a string'))
  it('should show error when validating non-string values', () => {
    string.validate({}).error.should.eq('value of type object is not a string')
    string.validate(0).error.should.eq('value of type number is not a string')
    string.validate(true).error.should.eq('value of type boolean is not a string')
    string.validate(Symbol()).error.should.eq('value of type symbol is not a string')
  })

  it('should show show error when validating text outside enum', () => {
    string.oneOf('a', 'b', 'c').validate('d').error.should.eq('string = "d" does not match any of { a, b, c }')
  })

  it('should show show error when validating text inside enum, but with extra space ', () => {
    string.oneOf('a', 'b', 'c').validate('b ').error.should.eq('string = "b " does not match any of { a, b, c }')
  })

  it('should show show error when starting with incorrect text', () => {
    string.startsWith('Lorem').validate('Hello World').error.should.eq('string = "Hello World" does not start with "Lorem"')
  })

  it('should show show error when ending with incorrect text', () => {
    string.endsWith('ipsum').validate('Hello World').error.should.eq('string = "Hello World" does not end with "ipsum"')
  })

  it('should show show error when ending with incorrect text', () => {
    string.contains('dolor').validate('Hello World').error.should.eq('string = "Hello World" does not contain text "dolor"')
  })

  it('should not show errors when validating null values if optional', () => should.not.exist(string.optional().validate(null).error))
  it('should not show errors when validating undefined values if optional', () => should.not.exist(string.optional().validate(undefined).error))

  it('should not show errors when validating valid text', () => {
    should.not.exist(string.validate('Lorem ipsum').error)
    should.not.exist(string.startsWith('Lorem').endsWith('ipsum').validate('Lorem ipsum').error)
    should.not.exist(string.oneOf('a', 'b', 'c').validate('b').error)
  })
})

describe('testing string schema subset validation', () => {
  it('should show error when checking with null ', () => {
    string.checkSubsetOf(null).should.deep.eql({
      isSubset: false,
      reason: 'target schema is null'
    })
  })
  
  it('should show error when checking with undefined ', () => {
    string.checkSubsetOf(undefined).should.deep.eql({
      isSubset: false,
      reason: 'target schema is undefined'
    })
  })
  
   it('should show error when checking with a number ', () => {
    string.checkSubsetOf(1).should.deep.eql({
      isSubset: false,
      reason: 'target of type number is not a schema'
    })
  })
  
   it('should show error when checking with an empty object ', () => {
    string.checkSubsetOf({}).should.deep.eql({
      isSubset: false,
      reason: 'target object is not a schema'
    })
  })
  
  it('should show error when checking with a different schema ', () => {
    const boolean = require('../..').boolean
    string.checkSubsetOf(boolean).should.deep.eql({
      isSubset: false,
      reason: 'StringSchema cannot be a subset of BooleanSchema'
    })
  })

  it('should show error when checking optional with required', () => {
    string.optional().checkSubsetOf(string).should.deep.eql({
      isSubset: false,
      reason: 'source schema allows null values while target does not'
    })
  })

  it('should show error if start string is different', () => {
    const subsetResult = string.startsWith('Lorem').checkSubsetOf(string.startsWith('Loren'))
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('source startsWith value = "Lorem" is different than target value = "Loren"')
  })

  it('should show error if end string is different', () => {
    const subsetResult = string.endsWith('ipsum').checkSubsetOf(string.endsWith('ipsun'))
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('source endsWith value = "ipsum" is different than target value = "ipsun"')
  })

  it('should show error if contains string is different', () => {
    const subsetResult = string.contains('ipsum').checkSubsetOf(string.contains('ipsun'))
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('source contains value = "ipsum" is different than target value = "ipsun"')
  })

  it('should show error if source does not have enumeration check while target has', () => {
    const subsetResult = string.checkSubsetOf(string.oneOf('c', 'a', 'b'))
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('source does not have enum check while target has { c, a, b }')
  })

  it('should show error if enumeration is not a subset', () => {
    const subsetResult = string.oneOf('a', 'b', 'c', 'd').checkSubsetOf(string.oneOf('c', 'a', 'b'))
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('source enum = { a, b, c, d } is not a subset of target enum = { c, a, b }')
  })

  it('should show error if enumeration have different values', () => {
    const subsetResult = string.oneOf('a', 'b', 'c').checkSubsetOf(string.oneOf('a', 'b', 'd'))
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('source enum = { a, b, c } is not a subset of target enum = { a, b, d }')
  })

  it('should be a subset if equal - enumeration in the same order', () => {
    const subsetResult = string.oneOf('a', 'b', 'c').checkSubsetOf(string.oneOf('a', 'b', 'c'))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset - enumeration to base', () => {
    const subsetResult = string.oneOf('a', 'b', 'c').checkSubsetOf(string)
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset - startsWith to base', () => {
    const subsetResult = string.startsWith('InitialText').checkSubsetOf(string)
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset - endsWith to base', () => {
    const subsetResult = string.endsWith('EndText').checkSubsetOf(string)
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset - contains to base', () => {
    const subsetResult = string.contains('some text').checkSubsetOf(string)
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset if equal - enumeration in different order', () => {
    const subsetResult = string.oneOf('a', 'b', 'c').checkSubsetOf(string.oneOf('c', 'a', 'b'))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset if equal - enumeration duplicate values', () => {
    const subsetResult = string.oneOf('a', 'b', 'c', 'b').checkSubsetOf(string.oneOf('c', 'a', 'b'))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset if enumeration subset in of another', () => {
    const subsetResult = string.oneOf('a', 'b', 'c').checkSubsetOf(string.oneOf('c', 'a', 'b', 'd'))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset if equal - startsWith & endsWith', () => {
    const subsetResult = string.startsWith('Lorem').endsWith('ipsum').checkSubsetOf(string.startsWith('Lorem').endsWith('ipsum'))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset if equal - startsWith, contains & endsWith', () => {
    const subsetResult = string.startsWith('Lorem').contains('ipsum').endsWith('dolor').checkSubsetOf(string.startsWith('Lorem').contains('ipsum').endsWith('dolor'))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset if equal', () => {
    const subsetResult = string.checkSubsetOf(string)
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })
})

describe('testing string enum schema sequential data generation', () => {
  it('should generate the posible values of the enum', () => {
    var it = string.oneOf('banana', 'apple', 'pear', 'pineapple').generateSequentialData()
    var result = []
    for (var c of it) {
      result.push(c)
    }
    result.should.deep.eql(['banana', 'apple', 'pear', 'pineapple'])
  })
})

describe('testing string enum schema random data generation', () => {
  it('should generate the posible values of the enum', () => {
    var it = string.oneOf('banana', 'apple', 'pear', 'pineapple').generateRandomData()
    var possibleValues = ['banana', 'apple', 'pear', 'pineapple']
    let allTrueORFalse = true
    for (var c of it) {
      allTrueORFalse = allTrueORFalse && possibleValues.indexOf(c) >= 0
      if (allTrueORFalse === false) {
        c.should.eql('mmm')
      }
    }
    allTrueORFalse.should.be.true
  })
})

describe('testing number schema sequential data generation', () => {
  function shouldNotShowAnyErrors (iterator, schema) {
    let noErrors = true
    for (var c of iterator) {
      noErrors = noErrors && (schema.validate(c).error == null)
      if (noErrors === false) { schema.validate(c).should.deep.eql({}) }
    }
    noErrors.should.be.true
  }

  it('should generate any string', () => {
    shouldNotShowAnyErrors(string.generateSequentialData(), string)
  })

  it('should generate any string starting with "beaba"', () => {
    var schema = string.startsWith('beaba')
    shouldNotShowAnyErrors(schema.generateSequentialData(), schema)
  })

  it('should generate any string ending with "beaba"', () => {
    var schema = string.endsWith('beaba')
    shouldNotShowAnyErrors(schema.generateSequentialData(), schema)
  })

  it('should generate any string starting with "Lorem" and ending with "ipsum"', () => {
    var schema = string.startsWith('Lorem').endsWith('ipsum')
    shouldNotShowAnyErrors(schema.generateSequentialData(), schema)
  })

  it('should generate any string starting with "Lorem", ending with "ipsum" and contains "amet"', () => {
    var schema = string.startsWith('Lorem').contains('ipsum').endsWith('amet')
    shouldNotShowAnyErrors(schema.generateSequentialData(), schema)
  })
})

describe('string schema random data generation', () => {
  function shouldNotShowAnyErrors (iterator, schema) {
    let noErrors = true
    for (var c of iterator) {
      noErrors = noErrors && (schema.validate(c).error == null)
      if (noErrors === false) { schema.validate(c).should.deep.eql({}) }
    }
    noErrors.should.be.true
  }

  it('should generate any string', () => {
    shouldNotShowAnyErrors(string.generateRandomData(), string)
  })

  it('should generate any string starting with "beaba"', () => {
    var schema = string.startsWith('beaba')
    shouldNotShowAnyErrors(schema.generateRandomData(), schema)
  })

  it('should generate any string ending with "beaba"', () => {
    var schema = string.endsWith('beaba')
    shouldNotShowAnyErrors(schema.generateRandomData(), schema)
  })

  it('should generate any string starting with "Lorem" and ending with "ipsum"', () => {
    var schema = string.startsWith('Lorem').endsWith('ipsum')
    shouldNotShowAnyErrors(schema.generateRandomData(), schema)
  })

  it('should generate any string starting with "Lorem", ending with "ipsum" and contains "amet"', () => {
    var schema = string.startsWith('Lorem').contains('ipsum').endsWith('amet')
    shouldNotShowAnyErrors(schema.generateRandomData(), schema)
  })
})
