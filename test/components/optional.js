const optional = require("../../lib/components/optional")
const number = require("../../lib/basic-types/number")
const string = require("../../lib/basic-types/string")
const boolean = require("../../lib/basic-types/boolean")
const should = require("chai").should()

describe("testing optional validation", () => {
  
  it("should not show errors when validating null values", () => optional.validate(null).error.should.eq("value is null"))
  it("should not show errors when validating undefined values", () => optional.validate(undefined).error.should.eq("value is undefined"))
  it("should not show errors when validating any value", () => {
    should.not.exist(optional.validate(1).error)
    should.not.exist(optional.validate({}).error)
    should.not.exist(optional.validate("").error)
    should.not.exist(optional.validate(true).error)
    should.not.exist(optional.validate(Symbol()).error)
  })
/*
  it("should show error when validating values that surpass the maximum required length", () => {
    optional.maxLength(2).validate([null,1,2,3]).error.should.eq("optional length = 4 is bigger than required maximum = 2")
    optional.maxLength(1).validate(["abc",1,2]).error.should.eq("optional length = 3 is bigger than required maximum = 1")
  })
  
  it("should show error when validating values that do not surpass the minimum required length", () => {
    optional.minLength(2).validate([null]).error.should.eq("optional length = 1 is smaller than required minimum = 2")
    optional.minLength(10).validate(["abc",1,2]).error.should.eq("optional length = 3 is smaller than required minimum = 10")
  })

  it("should show error when validating values that surpass the upper bound", () => {
    var validationResult = optional.of(number).validate([null])
    validationResult.error.should.have.length(1)
    validationResult.error[0].should.deep.equal({ error: 'value is null', index: 0 })
  })

  
  it("should not show error when validating valid optionals of a schema", () => {
    should.not.exist(optional.minLength(1).maxLength(3).of(number.min(0)).validate([20, 500]).error)
  })
  
  it("should not show error when validating valid optionals", () => {
    should.not.exist(optional.minLength(1).maxLength(20).validate([20, 500, null, undefined, "aa", "test"]).error)
  })
  */
})

describe("testing optional schema subset validation", () => {
/*
   it("should show error when checking with null ", () => {
    const subsetResult = optional.checkSubsetOf(null);
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('not comparing with another optionalSchema');
  })
  
  
   it("should show error when max length is bigger than target", () => {
    const subsetResult1 = optional.maxLength(11).checkSubsetOf(optional.maxLength(10));
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('target maximum length = 10 is smaller than source length = 11');
    
    const subsetResult2 = optional.maxLength(1101).checkSubsetOf(optional.maxLength(1000));
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('target maximum length = 1000 is smaller than source length = 1101');
  })
  
  it("should show error when min value is smaller than target", () => {
    const subsetResult1 = optional.minLength(10).checkSubsetOf(optional.minLength(11));
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('target minimum length = 11 is bigger than source length = 10');
    
    const subsetResult2 = optional.minLength(0).checkSubsetOf(optional.minLength(1));
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('target minimum length = 1 is bigger than source length = 0');
  })
  
  it("should show error when target has a record and source not", () => {
    const subsetResult1 = optional.checkSubsetOf(optional.of(number));
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('source has no record schema while target has NumberSchema');
    
    const subsetResult2 = optional.checkSubsetOf(optional.of(string));
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('source has no record schema while target has StringSchema');
  })
  
   it("should show error when target record that is not a subset", () => {
    const subsetResult1 = optional.of(number).checkSubsetOf(optional.of(number.max(10)));
    subsetResult1.isSubset.should.be.false
    subsetResult1.reason.should.eq('optional record subset: target maximum value = 10 is smaller than source value = Infinity');
    
    const subsetResult2 = optional.of(string).checkSubsetOf(optional.of(string.oneOf("Lorem")));
    subsetResult2.isSubset.should.be.false
    subsetResult2.reason.should.eq('optional record subset: source does not have enum check while target has { Lorem }');
  })
  
  it("should be a subset max and min boundary inside taget", () => {
    const subsetResult1 =  optional.minLength(0).maxLength(10).checkSubsetOf(optional);
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  optional.minLength(1).maxLength(5).checkSubsetOf(optional.minLength(0).maxLength(10));
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
  })
  
  it("should be a subset on equal record schema - number", () => {
    const subsetResult =  optional.of(number).checkSubsetOf(optional.of(number));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - string", () => {
    const subsetResult =  optional.of(string).checkSubsetOf(optional.of(string));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - boolean", () => {
    const subsetResult =  optional.of(boolean).checkSubsetOf(optional.of(boolean));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - optional", () => {
    const subsetResult =  optional.of(optional).checkSubsetOf(optional.of(optional));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - optional of number", () => {
    const subsetResult =  optional.of(optional.of(number)).checkSubsetOf(optional.of(optional.of(number)));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - optional of string", () => {
    const subsetResult =  optional.of(optional.of(string)).checkSubsetOf(optional.of(optional.of(string)));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - optional of boolean", () => {
    const subsetResult =  optional.of(optional.of(boolean)).checkSubsetOf(optional.of(optional.of(boolean)));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - optional of optional", () => {
    const subsetResult =  optional.of(optional.of(optional)).checkSubsetOf(optional.of(optional.of(optional)));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  /*
  it("should be a subset of target without division check", () => {
    const subsetResult =  optional.divisibleBy(2).checkSubsetOf(optional);
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset if equal", () => {
    const subsetResult1 =  optional.min(0).max(10).checkSubsetOf(optional.min(0).max(10));
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  optional.min(-9999).max(9999).checkSubsetOf(optional.min(-9999).max(9999));
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
    
    const subsetResult3 =  optional.checkSubsetOf(optional);
    subsetResult3.isSubset.should.be.true;
    should.not.exist(subsetResult3.reason);
  })
*/
})
