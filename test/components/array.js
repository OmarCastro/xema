const array = require("../../lib/components/array")
const should = require("chai").should()

describe("testing array validation", () => {
  
  it("should show error when validating null values", () => array.validate(null).error.should.eq("value is null"))
  it("should show error when validating undefined values", () => array.validate(undefined).error.should.eq("value is undefined"))
  it("should show error when validating non-array values", () => {
    array.validate({}).error.should.eq("object value is not an array")
    array.validate("").error.should.eq("value of type string is not an array")
    array.validate(true).error.should.eq("value of type boolean is not an array")
    array.validate(Symbol()).error.should.eq("value of type symbol is not an array")
  })

/*
  it("should show error when validating values that surpass the upper bound", () => {
    array.max(10).validate(11).error.should.eq("array = 11 is bigger than required maximum = 10")
    array.max(30).validate(30.0001).error.should.eq("array = 30.0001 is bigger than required maximum = 30")
    array.max(9999999).validate(+Infinity).error.should.eq("array = Infinity is bigger than required maximum = 9999999")
  })
  
  it("should show error when validating values that surpass the lower bound", () => {
    array.min(-10).validate(-11).error.should.eq("array = -11 is smaller than required minimum = -10")
    array.min(-30).validate(-30.0001).error.should.eq("array = -30.0001 is smaller than required minimum = -30")
    array.min(-9999999).validate(-Infinity).error.should.eq("array = -Infinity is smaller than required minimum = -9999999")
  })
  
  it("should show error when validating invalid integers", () => {
    array.integer().validate(1.1).error.should.eq("array = 1.1 is not divisible by = 1")
  })
  
  it("should show error when validating non divisibr values integers", () => {
    array.divisibleBy(2).validate(1.1).error.should.eq("array = 1.1 is not divisible by = 2")
  })
  
  it("should show not show error when validating valid arrays", () => {
    should.not.exist(array.min(1).max(3).integer().divisibleBy(2).validate(2).error)
  }) */
  
})
/*
describe("testing array schema subset validation", () => {
   it("should show error when checking with null ", () => {
    const subsetResult = array.checkSubsetOf(null);
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('not comparing with another arraySchema');
  })
  
  it("should show error when division validation value is different", () => {
    const subsetResult1 = array.integer().checkSubsetOf(array.integer().divisibleBy(2));
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('source division check value = 1 is not divisible by target value = 2');
    
    const subsetResult2 = array.integer().checkSubsetOf(array.divisibleBy(1.25));
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('source division check value = 1 is not divisible by target value = 1.25');
  })
  
   it("should show error when max value is bigger than target", () => {
    const subsetResult1 = array.max(11).checkSubsetOf(array.max(10));
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('target maximum value = 10 is smaller than source value = 11');
    
    const subsetResult2 = array.integer().max(1101).checkSubsetOf(array.integer().max(1000));
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('target maximum value = 1000 is smaller than source value = 1101');
  })
  
  it("should show error when min value is smaller than target", () => {
    const subsetResult1 = array.min(10).checkSubsetOf(array.min(11));
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('target minimum value = 11 is bigger than source value = 10');
    
    const subsetResult2 = array.integer().min(-1101).checkSubsetOf(array.integer().min(-1000));
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('target minimum value = -1000 is bigger than source value = -1101');
  })
  
  it("should be a subset max and min boundary inside taget", () => {
    const subsetResult1 =  array.min(0).max(10).checkSubsetOf(array);
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  array.min(-3).max(0.25).checkSubsetOf(array.min(-10).max(1));
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
  })
  
  it("should be a subset on divisible division check", () => {
    const subsetResult1 =  array.divisibleBy(10).checkSubsetOf(array.divisibleBy(1.25));
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  array.divisibleBy(2).checkSubsetOf(array.integer());
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
  })
  
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

})
*/