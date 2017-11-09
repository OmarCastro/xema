const number = require("../../lib/basic-types/number")
const should = require("chai").should()

describe("testing number validation", () => {
  
  it("should show error when validating null values", () => number.validate(null).error.should.eq("value is null"))
  it("should show error when validating undefined values", () => number.validate(undefined).error.should.eq("value is undefined"))
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
  
  it("should be a subset on divisible diision check", () => {
    const subsetResult1 =  number.divisibleBy(10).checkSubsetOf(number.divisibleBy(1.25));
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  number.divisibleBy(2).checkSubsetOf(number.integer());
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
  })
  
  it("should be a subset if equal", () => {
    const subsetResult1 =  number.min(0).max(10).checkSubsetOf(number.min(0).max(10));
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  number.min(-9999).max(9999).checkSubsetOf(number.min(-9999).max(9999));
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
  })

})
