const OptionalValueFeature = require('../features/optional-validation');
const BaseSubsetValidationFeature = require('../features/base-subset-validation');
const GeneratorOptionCleanFeature = require("../features/generator-option-clean")

const _maxLength = Symbol("max length")
const _minLength = Symbol("min length")
const _optional = OptionalValueFeature.optionalSymbol;
const _recordSchema = Symbol("record Validation")

const initialValues = {
  [_recordSchema]: null,
  [_maxLength]: Infinity,
  [_minLength]: 0  
}

var ArraySchema = function(otherSchema) {
  this[_recordSchema] = otherSchema[_recordSchema]
  this[_maxLength] = otherSchema[_maxLength]
  this[_minLength] = otherSchema[_minLength] 
};


ArraySchema.prototype.maxLength = function(maximum){
  const result = new this.constructor(this);
  result[_maxLength] = maximum;
  return result
}

ArraySchema.prototype.minLength = function(minimum){
  const result = new this.constructor(this);
  result[_minLength] = Math.max(minimum, 0);
  return result
}

ArraySchema.prototype.of = function(recordSchema){
  const result = new this.constructor(this);
  result[_recordSchema] = recordSchema;
  return result
}
  
ArraySchema.prototype.validate = function(value){
  switch(true){
    case value === null:
      return this[_optional] ? {} : {error: `value = null is not an array` }; 
    case value === undefined:
      return this[_optional] ? {} : {error: `value = undefined is not an array` }; 
    case typeof value !== 'object':
      return {error: `value of type ${typeof value} is not an array` }; 
    case !Array.isArray(value) :
      return {error: `object value is not an array` }; 
    case this[_maxLength] < value.length:
      return {error: `array length = ${value.length} is bigger than required maximum = ${this[_maxLength]}` }; 
    case this[_minLength] > value.length:
      return {error: `array length = ${value.length} is smaller than required minimum = ${this[_minLength]}` };
    case this[_recordSchema] == null:
      return {}
  }
  
  const schema = this[_recordSchema]
  const error = value.map((record, index) => {return {error: schema.validate(record).error, index}}).
    filter((recordValidation) => recordValidation.error != null)

  return ( error.length > 0 ) ? {error} : {}
}
  
ArraySchema.prototype.checkSubsetOf = function(targetSchema){
  switch(true){
    case this[_maxLength] > targetSchema[_maxLength]:
      return {isSubset: false, reason: `target maximum length = ${targetSchema[_maxLength]} is smaller than source length = ${this[_maxLength]}` }; 
    case this[_minLength] < targetSchema[_minLength]:
      return {isSubset: false, reason: `target minimum length = ${targetSchema[_minLength]} is bigger than source length = ${this[_minLength]}` }; 
    case targetSchema[_recordSchema] == null:
      return {isSubset: true};
    case this[_recordSchema] == null:
      return {isSubset: false, reason: `source has no record schema while target has ${targetSchema[_recordSchema].constructor.name}` }; 
  }
  
  const recordSubsetResult = this[_recordSchema].checkSubsetOf(targetSchema[_recordSchema])
  if(recordSubsetResult.isSubset === false ){
    recordSubsetResult.reason = `array record subset: ${recordSubsetResult.reason}`;
  }
  return recordSubsetResult;
  
}



ArraySchema.prototype.generateRandomData = function*(options){
  const maxAmount = options.maxAmount
  const minLength = this[_minLength] || 0
  const maxLength = isFinite(this[_maxLength]) ? this[_maxLength] : minLength + 10;
  const generator = this[_recordSchema].generateRandomData({maxAmount: Infinity })
  for(let i = 0; i < maxAmount; ++i){
    const length = Math.floor(Math.random() * (maxLength - minLength)) + minLength
    const result = [];
    for(let j = 0; j < length; j++){
      result.push(generator.next().value)
    }
    yield result
  }
}

const compose = (...args) =>  args.reduce((result, feature) => feature(result));
var ComposedArraySchema = compose(ArraySchema, OptionalValueFeature, GeneratorOptionCleanFeature, BaseSubsetValidationFeature);
module.exports = new ComposedArraySchema({});