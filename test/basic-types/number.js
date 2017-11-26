const number = require("../../lib/basic-types/number")
const should = require("chai").should()

describe("testing number validation", () => {
  
  it("should show error when validating null values", () => number.validate(null).error.should.eq("value = null is not a number"))
  it("should show error when validating undefined values", () => number.validate(undefined).error.should.eq("value = undefined is not a number"))
  it("should show error when validating non-number values", () => {
    number.validate({}).error.should.eq("value of type object is not a number")
    number.validate("").error.should.eq("value of type string is not a number")
    number.validate(true).error.should.eq("value of type boolean is not a number")
    number.validate(Symbol()).error.should.eq("value of type symbol is not a number")
  })
  it("should show error when validating NaN", () => number.validate(NaN).error.should.eq('value is NaN, "not a number"'))

  it("should show error when validating values that surpass the upper bound", () => {
    number.max(10).validate(11).error.should.eq("number = 11 is bigger than required maximum = 10")
    number.max(30).validate(30.0001).error.should.eq("number = 30.0001 is bigger than required maximum = 30")
    number.max(9999999).validate(+Infinity).error.should.eq("number = Infinity is bigger than required maximum = 9999999")
  })
  
  it("should show error when validating values that surpass the lower bound", () => {
    number.min(-10).validate(-11).error.should.eq("number = -11 is smaller than required minimum = -10")
    number.min(-30).validate(-30.0001).error.should.eq("number = -30.0001 is smaller than required minimum = -30")
    number.min(-9999999).validate(-Infinity).error.should.eq("number = -Infinity is smaller than required minimum = -9999999")
  })
  
  it("should not show errors when validating null values if optional", () => should.not.exist(number.optional().validate(null).error))
  it("should not show errors when validating undefined values if optional", () => should.not.exist(number.optional().validate(undefined).error))
  
  
  it("should show error when validating invalid integers", () => {
    number.integer().validate(1.1).error.should.eq("number = 1.1 is not divisible by = 1")
  })
  
  it("should show error when validating non divisibr values integers", () => {
    number.divisibleBy(2).validate(1.1).error.should.eq("number = 1.1 is not divisible by = 2")
  })
  
  it("should show not show error when validating valid numbers", () => {
    should.not.exist(number.min(1).max(3).integer().divisibleBy(2).validate(2).error)
  })
  
})

describe("testing number schema subset validation", () => {
   it("should show error when checking with null ", () => {
    const subsetResult = number.checkSubsetOf(null);
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('not comparing with another NumberSchema');
  })
  
  it("should show error when checking optional with required", () => {
    const subsetResult = number.optional().checkSubsetOf(number);
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq("source schema allows null values while target does not");
  })
  
  it("should show error when division validation value is different", () => {
    const subsetResult1 = number.integer().checkSubsetOf(number.integer().divisibleBy(2));
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('source division check value = 1 is not divisible by target value = 2');
    
    const subsetResult2 = number.integer().checkSubsetOf(number.divisibleBy(1.25));
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('source division check value = 1 is not divisible by target value = 1.25');
  })
  
   it("should show error when max value is bigger than target", () => {
    const subsetResult1 = number.max(11).checkSubsetOf(number.max(10));
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('target maximum value = 10 is smaller than source value = 11');
    
    const subsetResult2 = number.integer().max(1101).checkSubsetOf(number.integer().max(1000));
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('target maximum value = 1000 is smaller than source value = 1101');
  })
  
  it("should show error when min value is smaller than target", () => {
    const subsetResult1 = number.min(10).checkSubsetOf(number.min(11));
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('target minimum value = 11 is bigger than source value = 10');
    
    const subsetResult2 = number.integer().min(-1101).checkSubsetOf(number.integer().min(-1000));
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('target minimum value = -1000 is bigger than source value = -1101');
  })
  
  it("should be a subset max and min boundary inside taget", () => {
    const subsetResult1 =  number.min(0).max(10).checkSubsetOf(number);
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  number.min(-3).max(0.25).checkSubsetOf(number.min(-10).max(1));
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
  })
  
  it("should be a subset on divisible division check", () => {
    const subsetResult1 =  number.divisibleBy(10).checkSubsetOf(number.divisibleBy(1.25));
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  number.divisibleBy(2).checkSubsetOf(number.integer());
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
  })
  
  it("should be a subset of target without division check", () => {
    const subsetResult =  number.divisibleBy(2).checkSubsetOf(number);
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset if equal", () => {
    const subsetResult1 =  number.min(0).max(10).checkSubsetOf(number.min(0).max(10));
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  number.min(-9999).max(9999).checkSubsetOf(number.min(-9999).max(9999));
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
    
    const subsetResult3 =  number.checkSubsetOf(number);
    subsetResult3.isSubset.should.be.true;
    should.not.exist(subsetResult3.reason);
  })

})


describe("testing number schema sequential data generation", () => {
  function shouldNotShowAnyErrors(iterator, schema){
    let noErrors = true
    for(var c of iterator){
        noErrors = noErrors && (schema.validate(c).error == null)
    }
    noErrors.should.be.true
  }
  
   it("should generate any number", () => {
    var it = number.generateSequentialData()
    shouldNotShowAnyErrors(number.generateSequentialData(), number)
  })
  
  it("should generate any quarter", () => {
    var schema = number.divisibleBy(0.25);
    shouldNotShowAnyErrors(schema.generateSequentialData(), schema);
  })
  
  it("should generate any integer", () => {
    var schema = number.integer();
    shouldNotShowAnyErrors(schema.generateSequentialData(), schema);

  })
  
  it("should generate any integer pair", () => {
    var schema = number.integer().divisibleBy(2);
    shouldNotShowAnyErrors(schema.generateSequentialData(), schema);
  })
  
   it("should generate any positive integer pair", () => {
    var schema = number.integer().divisibleBy(2).min(0);
    shouldNotShowAnyErrors(schema.generateSequentialData(), schema);
  })
  
 it("should generate any positive integer pair less than 10", () => {
    var schema = number.integer().divisibleBy(2).min(0).max(10)
    var it = schema.generateSequentialData()
    var result = []
    for(var c of it){
       result.push(c);
    }
    result.should.deep.eql([0,2,4,6,8,10]);
  })

})

describe("testing number schema random data generation", () => {
  function shouldNotShowAnyErrors(iterator, schema){
    let noErrors = true
    for(var c of iterator){
        noErrors = noErrors && (schema.validate(c).error == null)
    }
    noErrors.should.be.true
  }
  
  it("should generate any number", () => {
    shouldNotShowAnyErrors(number.generateRandomData(), number)
  })
  
  it("should generate any quarter", () => {
    var schema = number.divisibleBy(0.25)
    shouldNotShowAnyErrors(schema.generateRandomData(), schema)

  })
  
  it("should generate any integer", () => {
    var schema = number.integer()
    shouldNotShowAnyErrors(schema.generateRandomData(), schema)

  })
  
  it("should generate any integer pair", () => {
    var schema = number.integer().divisibleBy(2)
    shouldNotShowAnyErrors(schema.generateRandomData(), schema)
  })
  
   it("should generate any positive integer pair", () => {
    var schema = number.integer().divisibleBy(2).min(0)
    shouldNotShowAnyErrors(schema.generateRandomData(), schema)
  })
  
 it("should generate any positive integer pair less than 10", () => {
    var schema = number.integer().divisibleBy(2).min(0).max(10)
    var it = schema.generateRandomData()
    let isAllValid = true
    for(var c of it){
      isAllValid = isAllValid && (c >= 0 && c <= 10 && c % 2 === 0)
    }
    isAllValid.should.be.true;
  })

})