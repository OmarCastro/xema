const {boolean, number, string, array} = require('../..')
const should = require('chai').should()

describe('testing array validation', () => {
  it('should show error when validating null values', () => array.validate(null).error.should.eq('value = null is not an array'))
  it('should show error when validating undefined values', () => array.validate(undefined).error.should.eq('value = undefined is not an array'))
  it('should show error when validating non-array values', () => {
    array.validate({}).error.should.eq('object value is not an array')
    array.validate('').error.should.eq('value of type string is not an array')
    array.validate(true).error.should.eq('value of type boolean is not an array')
    array.validate(Symbol()).error.should.eq('value of type symbol is not an array')
  })

  it('should show error when validating values that surpass the maximum required length', () => {
    array.maxLength(2).validate([null, 1, 2, 3]).error.should.eq('array length = 4 is bigger than required maximum = 2')
    array.maxLength(1).validate(['abc', 1, 2]).error.should.eq('array length = 3 is bigger than required maximum = 1')
  })

  it('should show error when validating values that do not surpass the minimum required length', () => {
    array.minLength(2).validate([null]).error.should.eq('array length = 1 is smaller than required minimum = 2')
    array.minLength(10).validate(['abc', 1, 2]).error.should.eq('array length = 3 is smaller than required minimum = 10')
  })

  it('should show error when validating values that surpass the upper bound', () => {
    var validationResult = array.of(number).validate([null])
    validationResult.error.should.have.length(1)
    validationResult.error.should.deep.equal([
      { error: 'value = null is not a number', index: 0 }
    ])
  })

  it('should not show errors when validating null values if optional', () => array.optional().validate(null).should.deep.eql({}))
  it('should not show errors when validating undefined values if optional', () => array.optional().validate(undefined).should.deep.eql({}))

  it('should show not show error when validating valid arrays of a schema', () => {
    should.not.exist(array.minLength(1).maxLength(3).of(number.min(0)).validate([20, 500]).error)
  })

  it('should show not show error when validating valid arrays', () => {
    should.not.exist(array.minLength(1).maxLength(20).validate([20, 500, null, undefined, 'aa', 'test']).error)
  })
})

describe('testing array schema subset validation', () => {
  it('should show error when checking with null ', () => {
    array.checkSubsetOf(null).should.deep.eql({
      isSubset: false,
      reason: 'target schema is null'
    })
  })

  it('should show error when checking with undefined ', () => {
    array.checkSubsetOf(undefined).should.deep.eql({
      isSubset: false,
      reason: 'target schema is undefined'
    })
  })

  it('should show error when checking with a number ', () => {
    array.checkSubsetOf(1).should.deep.eql({
      isSubset: false,
      reason: 'target of type number is not a schema'
    })
  })

  it('should show error when checking with an empty object ', () => {
    array.checkSubsetOf({}).should.deep.eql({
      isSubset: false,
      reason: 'target object is not a schema'
    })
  })

  it('should show error when checking with a different schema ', () => {
    array.checkSubsetOf(boolean).should.deep.eql({
      isSubset: false,
      reason: 'ArraySchema cannot be a subset of BooleanSchema'
    })
  })

  it('should show error when checking optional with required', () => {
    const subsetResult = array.optional().checkSubsetOf(array)
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('source schema allows null values while target does not')
  })

  it('should show error when max length is bigger than target', () => {
    const subsetResult1 = array.maxLength(11).checkSubsetOf(array.maxLength(10))
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('target maximum length = 10 is smaller than source length = 11')

    const subsetResult2 = array.maxLength(1101).checkSubsetOf(array.maxLength(1000))
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('target maximum length = 1000 is smaller than source length = 1101')
  })

  it('should show error when min value is smaller than target', () => {
    const subsetResult1 = array.minLength(10).checkSubsetOf(array.minLength(11))
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('target minimum length = 11 is bigger than source length = 10')

    const subsetResult2 = array.minLength(0).checkSubsetOf(array.minLength(1))
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('target minimum length = 1 is bigger than source length = 0')
  })

  it('should show error when target has a record and source not', () => {
    const subsetResult1 = array.checkSubsetOf(array.of(number))
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('source has no record schema while target has NumberSchema')

    const subsetResult2 = array.checkSubsetOf(array.of(string))
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('source has no record schema while target has StringSchema')
  })

  it('should show error when target record that is not a subset', () => {
    const subsetResult1 = array.of(number).checkSubsetOf(array.of(number.max(10)))
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('array record subset: target maximum value = 10 is smaller than source value = Infinity')

    const subsetResult2 = array.of(string).checkSubsetOf(array.of(string.oneOf('Lorem')))
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('array record subset: source does not have enum check while target has { Lorem }')
  })

  it('should be a subset max and min boundary inside taget', () => {
    const subsetResult1 = array.minLength(0).maxLength(10).checkSubsetOf(array)
    subsetResult1.isSubset.should.be.true
    should.not.exist(subsetResult1.reason)

    const subsetResult2 = array.minLength(1).maxLength(5).checkSubsetOf(array.minLength(0).maxLength(10))
    subsetResult2.isSubset.should.be.true
    should.not.exist(subsetResult2.reason)
  })

  it('should be a subset on equal record schema - number', () => {
    const subsetResult = array.of(number).checkSubsetOf(array.of(number))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset on equal record schema - string', () => {
    array.of(string).checkSubsetOf(array.of(string)).should.eql({
      isSubset: true
    })
  })

  it('should be a subset on equal record schema - boolean', () => {
    array.of(boolean).checkSubsetOf(array.of(boolean)).should.eql({
      isSubset: true
    })
  })

  it('should be a subset on equal record schema - array', () => {
    array.of(array).checkSubsetOf(array.of(array)).should.eql({
      isSubset: true
    })
  })

  it('should be a subset on equal record schema - array of number', () => {
    array.of(array.of(number)).checkSubsetOf(array.of(array.of(number))).should.eql({
      isSubset: true
    })
  })

  it('should be a subset on equal record schema - array of string', () => {
    array.of(array.of(string)).checkSubsetOf(array.of(array.of(string))).should.eql({
      isSubset: true
    })
  })

  it('should be a subset on equal record schema - array of boolean', () => {
    array.of(array.of(boolean)).checkSubsetOf(array.of(array.of(boolean))).should.eql({
      isSubset: true
    })
  })

  it('should be a subset on equal record schema - array of array', () => {
    array.of(array.of(array)).checkSubsetOf(array.of(array.of(array))).should.eql({
      isSubset: true
    })
  })

  it('should be a subset if equal - base array', () => {
    array.checkSubsetOf(array).should.eql({
      isSubset: true
    })
  })

  it('should be a subset if equal - same min and max value', () => {
    array.minLength(0).maxLength(10).checkSubsetOf(array.minLength(0).maxLength(10)).should.eql({
      isSubset: true
    })
  })
})

describe('testing array schema instance Validation', () => {
  it('should show error when max length is null ', () => {
    array.maxLength(null).hasErrors.should.be.true
    array.maxLength(null).errors.should.deep.eql([
      'maximum length is null'
    ])
  })

  it('should show error when max length is undefined ', () => {
    array.maxLength(undefined).hasErrors.should.be.true
    array.maxLength(undefined).errors.should.deep.eql([
      'maximum length is undefined'
    ])
  })
  it('should show error when max length is not a number ', () => {
    array.maxLength([]).hasErrors.should.be.true
    array.maxLength([]).errors.should.deep.eql([
      'maximum length of type "object" is not a number'
    ])
  })

  it('should show error when max length is negative ', () => {
    array.maxLength(-1).hasErrors.should.be.true
    array.maxLength(-1).errors.should.deep.eql([
      'maximum length = -1 must be a positive value'
    ])
  })

  it('should show error when min length is null ', () => {
    array.minLength(null).hasErrors.should.be.true
    array.minLength(null).errors.should.deep.eql([
      'minimum length is null'
    ])
  })

  it('should show error when min length is undefined ', () => {
    array.minLength(undefined).hasErrors.should.be.true
    array.minLength(undefined).errors.should.deep.eql([
      'minimum length is undefined'
    ])
  })
  it('should show error when min length is not a number ', () => {
    array.minLength([]).hasErrors.should.be.true
    array.minLength([]).errors.should.deep.eql([
      'minimum length of type "object" is not a number'
    ])
  })

  it('should show error when min length is negative ', () => {
    array.minLength(-1).hasErrors.should.be.true
    array.minLength(-1).errors.should.deep.eql([
      'minimum length = -1 must be a positive value'
    ])
  })

  it('should show error when min length is greater then max length ', () => {
    array.minLength(1).maxLength(0).hasErrors.should.be.true
    array.minLength(1).maxLength(0).errors.should.deep.eql([
      'required minimum length = 1 is greater than required maximum length = 0'
    ])
  })

  it('should show error when record schema is not a schema ', () => {
    array.of('a').hasErrors.should.be.true
    array.of('a').errors.should.deep.eql([
      'recordSchema is not a schema'
    ])
  })

  it('should show error when record schema is invalid', () => {
    array.of(number.max({}).min('ss')).hasErrors.should.be.true
    array.of(number.max({}).min('ss')).errors.should.deep.eql([
      {
        'schemaErrors': [
          'maximum required value of type "object" is not a number',
          'minimum required value of type "string" is not a number'
        ]
      }
    ])
  })

  it('should show error when validating a value with an invalid schema', () => {
    array.maxLength({}).validate([]).should.deep.eql({
      error: 'schema is invalid'
    })
  })

  it('should not be a subset of an invalid schema', () => {
    array.maxLength(20).checkSubsetOf(array.maxLength({})).should.deep.eql({
      isSubset: false,
      reason: 'target schema is invalid'
    })
  })

  it('should not be a subset of an invalid schema', () => {
    array.maxLength({}).checkSubsetOf(array).should.deep.eql({
      isSubset: false,
      reason: 'source schema is invalid'
    })
  })

  it('should not be a subset of an invalid schema', () => {
    array.maxLength({}).checkSubsetOf(array.maxLength({})).should.deep.eql({
      isSubset: false,
      reason: 'source and target schemas are invalid'
    })
  })

  it('should not generate any random data if invalid ', () => {
    var result = []
    for (var value of array.maxLength(0).minLength(1).generateRandomData()) {
      result.push(value)
    }
    result.should.eql([])
  })
})

describe('testing array schema random data generation', () => {
  function shouldNotShowAnyErrors (iterator, schema) {
    let noErrors = true
    for (var c of iterator) {
      noErrors = noErrors && (schema.validate(c).error == null)
      if (noErrors === false) {
        schema.validate(c).should.deep.eql({})
      }
    }
    noErrors.should.be.true
  }

  it('should generate any string array', () => {
    var schema = array.of(string.startsWith('beaba'))
    shouldNotShowAnyErrors(schema.generateRandomData(), schema)
  })

  it('should generate any number array', () => {
    var schema = array.of(number).maxLength(20)
    shouldNotShowAnyErrors(schema.generateRandomData(), schema)
  })
})
