const {boolean, number, string, array, object} = require("../..");
const should = require("chai").should()

describe("testing object validation", () => {
  
  it("should show error when validating null values", () => object.validate(null).error.should.eq("value = null is not an object"))
  it("should show error when validating undefined values", () => object.validate(undefined).error.should.eq("value = undefined is not an object"))
  it("should show error when validating non-object values", () => {
    object.validate(1).error.should.eq("value of type number is not an object")
    object.validate("").error.should.eq("value of type string is not an object")
    object.validate(true).error.should.eq("value of type boolean is not an object")
    object.validate(Symbol()).error.should.eq("value of type symbol is not an object")
  })
  
  
  it("should not show errors when validating arrays", () => {
    object.validate([]).error.should.eq("value is an array, expected an object")
  })

  it("should not show errors when validating null values if optional", () => object.optional().validate(null).should.deep.eql({}))
  it("should not show errors when validating undefined values if optional", () => object.optional().validate(undefined).should.deep.eql({}))

  it("should not show errors when validating object", () => {
    should.not.exist(object.validate({}).error)
  })
  
  it("should not show errors when validating object with string schema as key", () => {
    should.not.exist(object.keys({string}).validate({string: "Lorem"}).error)
  })
  
  it("should not show errors when validating null with object number schema", () => {
    should.not.exist(object.keys({number}).validate({number: 0}).error)
  })
  
  it("should not show errors when validating null with object boolean schema", () => {
    should.not.exist(object.keys({boolean}).validate({boolean: true}).error)
  })
  
  it("should not show errors when validating null with object array schema", () => {
    should.not.exist(object.keys({array}).validate({array: ["Lorem"]}).error)
  })
  
  
  it("should show record schema error when validating invalid object with numbers", () => {
    object.keys({number: number.max(10)}).validate({number: 11}).error.should.deep.eq({
      number: "number = 11 is bigger than required maximum = 10"
    })
    object.keys({max: number.max(30)}).validate({max: 30.0001}).error.should.deep.eq({
      max: "number = 30.0001 is bigger than required maximum = 30"
    })
    object.keys({Lorem:number.max(9999999)}).validate({Lorem: +Infinity}).error.should.deep.eq({
      Lorem: "number = Infinity is bigger than required maximum = 9999999"
    })
  })
  
  it("should show record schema error when validating invalid object with numbers", () => {
    object.keys({
      number: number.max(10),
      string: string.endsWith("ok")
    }).validate({
      number: 11
    }).error.should.deep.eq({
      number: "number = 11 is bigger than required maximum = 10",
      string: "value = undefined is not a string"
    })
  });
  
  it("should show record schema error when validating invalid object with numbers and string", () => {

    object.keys({
      number: number.max(10),
      string: string.endsWith("ok")
    }).validate({
      number: 11,
      string: "mako"
    }).error.should.deep.eq({
      number: "number = 11 is bigger than required maximum = 10",
      string: 'string = "mako" does not end with "ok"'
    })
    
  });
  
  it("should show record schema error when validating invalid object with numbers and optional string", () => {
    object.keys({
      number: number.max(10),
      string: string.optional().endsWith("ok")
    }).validate({
      number: 11,
    }).error.should.deep.eq({
      number: "number = 11 is bigger than required maximum = 10",
    })
  })
  

})

describe("testing object schema subset validation", () => {

   it("should show error when checking with null ", () => {
    const subsetResult = object.checkSubsetOf(null);
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('not comparing with another ObjectSchema');
  })
  
  it("should show error when checking base objectSchema with objectSchema with keys ", () => {
    object.checkSubsetOf(object.keys({string})).should.deep.eql({
      isSubset: true
    });
  })
  
   it("should show error when checking with boolean ", () => {
    const subsetResult = object.checkSubsetOf(boolean);
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('not comparing with another ObjectSchema');
  })
  
  
  it("should show error - source schema with more keys than target, one extra key", () => {
    object.keys({number, string}).checkSubsetOf(object.keys({string})).should.deep.eql({
      isSubset: false,
      reason: '{ number: "not comparing with another NumberSchema" }'
    });
  })
  
  it("should show error - source schema with more keys than target, more than one extra keys", () => {
    const subsetResult =  object.keys({number, string, map: object}).checkSubsetOf(object.keys({string}));
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('{ number: "not comparing with another NumberSchema", map: "not comparing with another ObjectSchema" }');
  })
  
  it("should show error - source schema with different keys than target", () => {
    const subsetResult =  object.keys({number: string}).checkSubsetOf(object.keys({string: string}));
    subsetResult.isSubset.should.be.false
    subsetResult.reason.should.eq('{ number: "not comparing with another StringSchema" }');
  })
  
   it("should show error - object with record to base", () => {
    
    object.keys({number}).checkSubsetOf(object).should.deep.eql({
      isSubset: false,
      "reason": "target has no record schema map while source has map { number: NumberSchema }"
    });
  })
  
  it("should be a subset - source schema with less keys than target, one extra key", () => {
    const subsetResult =  object.keys({string}).checkSubsetOf(object.keys({number, string}));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
  
  it("should be a subset - source schema with less keys than target, more than one extra keys", () => {
    const subsetResult =  object.keys({string}).checkSubsetOf(object.keys({number, string, key: object}));
    subsetResult.isSubset.should.be.true;
    should.not.exist(subsetResult.reason);
  })
 
 
  
  it("should be a subset if equal", () => {
    object.checkSubsetOf(object).should.deep.eql({
      isSubset: true,
    });
  });
  
})

describe("testing number schema random data generation", () => {
  function shouldNotShowAnyErrors(iterator, schema){
    let noErrors = true
    for(var c of iterator){
        noErrors = noErrors && (schema.validate(c).error == null)
        if(noErrors === false){ schema.validate(c).should.deep.eql({}) }
    }
    noErrors.should.be.true
  }
  
  
  it("should generate any string array", () => {
    var schema = object.keys({string: string.startsWith("beaba")});
    shouldNotShowAnyErrors(schema.generateRandomData(), schema);
  })
  

})
