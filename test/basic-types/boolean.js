var boolean = require("../../lib/basic-types/boolean")
const should = require("chai").should()

describe("testing boolean validation", () => {
  
  it("should show error when validating null values", () => boolean.validate(null).error.should.eq("value is null"))
  it("should show error when validating undefined values", () => boolean.validate(undefined).error.should.eq("value is undefined"))
  it("should show error when validating non-boolean values", () => {
    boolean.validate({}).error.should.eq("value of type object is not a boolean")
    boolean.validate("").error.should.eq("value of type string is not a boolean")
    boolean.validate(0).error.should.eq("value of type number is not a boolean")
    boolean.validate(Symbol()).error.should.eq("value of type symbol is not a boolean")
  })

 
  
  it("should show not show error when validating boolean", () => {
    should.not.exist(boolean.validate(true).error)
    should.not.exist(boolean.validate(false).error)
  })
  
})

describe("testing number schema subset validation", () => {
   it("should show error when checking with null ", () => {
    const subsetResult = boolean.checkSubsetOf(null);
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('not comparing with another BooleanSchema');
  })
  
  
  it("should be a subset if equal", () => {
    const subsetResult =  boolean.checkSubsetOf(boolean);
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })

})
