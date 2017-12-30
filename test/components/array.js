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
    const subsetResult = array.checkSubsetOf(null)
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('not comparing with another ArraySchema')
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
    const subsetResult = array.of(string).checkSubsetOf(array.of(string))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset on equal record schema - boolean', () => {
    const subsetResult = array.of(boolean).checkSubsetOf(array.of(boolean))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset on equal record schema - array', () => {
    const subsetResult = array.of(array).checkSubsetOf(array.of(array))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset on equal record schema - array of number', () => {
    const subsetResult = array.of(array.of(number)).checkSubsetOf(array.of(array.of(number)))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset on equal record schema - array of string', () => {
    const subsetResult = array.of(array.of(string)).checkSubsetOf(array.of(array.of(string)))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset on equal record schema - array of boolean', () => {
    const subsetResult = array.of(array.of(boolean)).checkSubsetOf(array.of(array.of(boolean)))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })

  it('should be a subset on equal record schema - array of array', () => {
    const subsetResult = array.of(array.of(array)).checkSubsetOf(array.of(array.of(array)))
    subsetResult.isSubset.should.be.true
    should.not.exist(subsetResult.reason)
  })
  /*
  it("should be a subset of target without division check", () => {
    const subsetResult =  array.divisibleBy(2).checkSubsetOf(array);
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })

  it("should be a subset if equal", () => {
    const subsetResult1 =  array.min(0).max(10).checkSubsetOf(array.min(0).max(10));
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);

    const subsetResult2 =  array.min(-9999).max(9999).checkSubsetOf(array.min(-9999).max(9999));
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);

    const subsetResult3 =  array.checkSubsetOf(array);
    subsetResult3.isSubset.should.be.true;
    should.not.exist(subsetResult3.reason);
  })
*/
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
