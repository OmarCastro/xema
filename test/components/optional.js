const optional = require("../../lib/components/optional")
const array = require("../../lib/components/array")
const number = require("../../lib/basic-types/number")
const string = require("../../lib/basic-types/string")
const boolean = require("../../lib/basic-types/boolean")
const should = require("chai").should()

describe("testing optional validation", () => {
  
  it("should not show errors when validating null values", () => should.not.exist(optional.validate(null).error))
  it("should not show errors when validating undefined values", () => should.not.exist(optional.validate(undefined).error))
  it("should not show errors when validating any value", () => {
    should.not.exist(optional.validate(1).error)
    should.not.exist(optional.validate({}).error)
    should.not.exist(optional.validate("").error)
    should.not.exist(optional.validate(true).error)
    should.not.exist(optional.validate(Symbol()).error)
  })
  
  it("should not show errors when validating null with optional string schema", () => {
    should.not.exist(optional(string).validate(null).error)
  })
  
  it("should not show errors when validating null with optional number schema", () => {
    should.not.exist(optional(number).validate(null).error)
  })
  
  it("should not show errors when validating null with optional boolean schema", () => {
    should.not.exist(optional(boolean).validate(null).error)
  })
  
  it("should not show errors when validating null with optional array schema", () => {
    should.not.exist(optional(array).validate(null).error)
  })
  
  it("should not show errors when validating undefined with optional string schema", () => {
    should.not.exist(optional(string).validate(undefined).error)
  })
  
  it("should not show errors when validating undefined with optional number schema", () => {
    should.not.exist(optional(number).validate(undefined).error)
  })
  
  it("should not show errors when validating undefined with optional boolean schema", () => {
    should.not.exist(optional(boolean).validate(undefined).error)
  })
  
  it("should not show errors when validating undefined with optional array schema", () => {
    should.not.exist(optional(array).validate(undefined).error)
  })
  
  it("should show record schema error when validating invalid numbers", () => {
    optional(number.max(10)).validate(11).error.should.eq("number = 11 is bigger than required maximum = 10")
    optional(number.max(30)).validate(30.0001).error.should.eq("number = 30.0001 is bigger than required maximum = 30")
    optional(number.max(9999999)).validate(+Infinity).error.should.eq("number = Infinity is bigger than required maximum = 9999999")
  })

})

describe("testing optional schema subset validation", () => {

   it("should show error when checking with null ", () => {
    const subsetResult = optional.checkSubsetOf(null);
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('not comparing with another OptionalSchema');
  })
  
  it("should show error when checking with null ", () => {
    const subsetResult = optional.checkSubsetOf(optional.of(number));
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('source has no record schema while target has NumberSchema');
  })
  
  it("should show error when checking with null ", () => {
    const subsetResult = optional(string).checkSubsetOf(optional.of(number));
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('optional record subset: not comparing with another StringSchema');
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
  
  it("should be a subset on equal record schema - array of number", () => {
    const subsetResult =  optional.of(array.of(number)).checkSubsetOf(optional.of(array.of(number)));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - array of string", () => {
    const subsetResult =  optional.of(array.of(string)).checkSubsetOf(optional.of(array.of(string)));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - array of boolean", () => {
    const subsetResult =  optional.of(array.of(boolean)).checkSubsetOf(optional.of(array.of(boolean)));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - array of optional", () => {
    const subsetResult =  optional.of(array.of(optional)).checkSubsetOf(optional.of(array.of(optional)));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset on equal record schema - array of array", () => {
    const subsetResult =  optional.of(array.of(array)).checkSubsetOf(optional.of(array.of(array)));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset - optional with record to base", () => {
    const subsetResult1 =  optional.of(number).checkSubsetOf(optional);
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  optional(number).checkSubsetOf(optional);
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
  })
  
  it("should be a subset if equal", () => {
    const subsetResult1 =  optional.of(number).checkSubsetOf(optional.of(number));
    subsetResult1.isSubset.should.be.true;
    should.not.exist(subsetResult1.reason);
    
    const subsetResult2 =  optional(number).checkSubsetOf(optional(number));
    subsetResult2.isSubset.should.be.true;
    should.not.exist(subsetResult2.reason);
  })

})
