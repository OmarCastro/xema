const OptionalValueFeature = require('../features/optional-validation.js')
const BaseSubsetValidationFeature = require('../features/base-subset-validation.js')

const _optional = OptionalValueFeature.optionalSymbol;

function BooleanSchema() {};

BooleanSchema.prototype.validate = function(value){
  switch(true){
    case value === null:
      return this[_optional] ? {} : {error: `value = null is not a boolean` }; 
    case value === undefined:
      return this[_optional] ? {} : {error: `value = undefined is not a boolean` }; 
    case typeof value !== 'boolean':
      return {error: `value of type ${typeof value} is not a boolean` }; 
    default:
      return {};
  }
};
  
  
BooleanSchema.prototype.checkSubsetOf = (targetSchema) => {return {isSubset: true}};
BooleanSchema.prototype.generateSequentialData = function*(){
  yield false
  yield true
};


BooleanSchema.prototype.generateRandomData = function*(options){
  options = options || {}
  const maxAmount = (options.maxAmount|0) || 10000
  for(let i = 0; i < maxAmount; ++i){
    yield Math.random() >= 0.5
  }
}

const compose = (...args) =>  args.reduce((result, feature) => feature(result));
var ComposedBooleanSchema = compose(BooleanSchema, OptionalValueFeature, BaseSubsetValidationFeature)
module.exports = new ComposedBooleanSchema({});