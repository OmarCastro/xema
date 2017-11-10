const string = require("../../lib/basic-types/string")
const should = require("chai").should()

describe("testing string validation", () => {
  
  it("should show error when validating null values", () => string.validate(null).error.should.eq("value is null"))
  it("should show error when validating undefined values", () => string.validate(undefined).error.should.eq("value is undefined"))
  it("should show error when validating non-string values", () => {
    string.validate({}).error.should.eq("value of type object is not a string")
    string.validate(0).error.should.eq("value of type number is not a string")
    string.validate(true).error.should.eq("value of type boolean is not a string")
    string.validate(Symbol()).error.should.eq("value of type symbol is not a string")
  })

  
})

describe("testing string schema subset validation", () => {
  
 
  it("should be a subset if equal - enumeration in the same order", () => {
    const subsetResult =  string.oneOf("a","b","c").isSubsetOf(string.oneOf("a","b","c"))
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  }) 
  
  it("should be a subset if equal - enumeration in different order", () => {
    const subsetResult =  string.oneOf("a","b","c").isSubsetOf(string.oneOf("c","a","b"))
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  }) 
  
  it("should be a subset if equal - startsWith & endsWith", () => {
    const subsetResult =  string.startsWith('Lorem').endsWith('ipsum').isSubsetOf(string.startsWith('Lorem').endsWith('ipsum'))
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset if equal", () => {  
    const subsetResult =  string.isSubsetOf(string)
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })

})