const OptionalValueFeature = require('../features/optional-validation.js')
const BaseSubsetValidationFeature = require('../features/base-subset-validation.js')

const _keys = Symbol("keys")
const _optional = OptionalValueFeature.optionalSymbol;
const _recordSchema = Symbol("record Validation")

const initialValues = {
  [_keys]: {},
}

var ObjectSchema = function(otherSchema) {
    this[_keys] = Object.assign({}, otherSchema[_keys]);
};

(function() {
  
  this.keys = function(schema){
    const result = new this.constructor(this);
    result[_keys] = Object.assign({}, result[_keys], schema);;
    return result
  }
  
  this.validate = function(value){
    switch(true){
      case value === null:
        return this[_optional] ? {} : {error: `value = null is not an object` }; 
      case value === undefined:
        return this[_optional] ? {} : {error: `value = undefined is not an object` }; 
      case typeof value !== 'object':
        return {error: `value of type ${typeof value} is not an object` }; 
      case Array.isArray(value) :
        return {error: `value is an array, expected an object` }; 
    }
    
    const schema = this[_recordSchema]
    const error = Object.keys(this[_keys]).
        map((key) => {return {error: this[_keys][key].validate(value[key]).error, key}}).
        filter((recordValidation) => recordValidation.error != null).
        reduce((result, recordValidation) => {
          result[recordValidation.key] = recordValidation.error 
          return result
        }, {})
    
   return (  Object.keys(error).length > 0 ) ? {error} : {}
  }
  
  function printSchemaMap(targetSchema){
    const keys = targetSchema[_keys]
    return `{ ${Object.keys(keys).map((key) => `${key}: ${keys[key].constructor.name}`).join(", ")} }`
  }
  
  function isSubsetByKeys(sourceSchema, targetSchema){
    const sourceKeys = sourceSchema[_keys];
    const targetKeys = targetSchema[_keys];
    var reasons = Object.keys(sourceKeys).reduce((array, key) => {
      var result = sourceKeys[key].checkSubsetOf( targetKeys[key]);
      if(!result.isSubset){
        result.reason = `${key}: ${JSON.stringify(result.reason)}`
        array.push(result);
      }
      return array;
    },[])
    if(reasons.length === 0){
      return {isSubset: true };
    } else {
      return {isSubset: false, reason: `{ ${reasons.map((result) => result.reason).join(", ")} }` };
    }
  }
  
 this.checkSubsetOf = function(targetSchema){
   switch(true){
    case Object.keys(this[_keys]).length === 0:
      return {isSubset: true }; 
    case Object.keys(targetSchema[_keys]).length === 0:
      return {isSubset: false, reason: `target has no record schema map while source has map ${printSchemaMap(this)}` }; 
   }
  
   return isSubsetByKeys(this, targetSchema);
  
  }

}).call(ObjectSchema.prototype);

ObjectSchema.prototype.generateRandomData = function*(options){
  options = options || {}
  const maxAmount = (options.maxAmount|0) || 10000
  const keyObjs = this[_keys];
  const keys = Object.keys(keyObjs);
  const generators = keys.reduce((prev, key) => {
    prev[key] = keyObjs[key].generateRandomData({maxAmoun : Infinity})
    return prev
  }, {})
  for(let i = 0; i < maxAmount; ++i){
    yield keys.reduce((prev, key) => {
      prev[key] = generators[key].next().value;
      return prev
    }, {})
  }
}

const compose = (...args) =>  args.reduce((result, feature) => feature(result));
var ComposedObjectSchema = compose(ObjectSchema, OptionalValueFeature, BaseSubsetValidationFeature);
module.exports = new ComposedObjectSchema(initialValues);