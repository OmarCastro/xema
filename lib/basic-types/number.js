const OptionalValueFeature = require('../features/optional-validation.js');
const BaseSubsetValidationFeature = require('../features/base-subset-validation.js');
const GeneratorOptionCleanFeature = require("../features/generator-option-clean")

const _optional = OptionalValueFeature.optionalSymbol;
const _max = Symbol("max")
const _min = Symbol("min")
const _divisibleBy = Symbol("divisibleBy")

const initialValues = {
  [_divisibleBy]: 0,
  [_max]: Infinity,
  [_min]: -Infinity  
}

function NumberSchema(otherNumber) {
  this[_divisibleBy] = otherNumber[_divisibleBy]
  this[_max] = otherNumber[_max]
  this[_min] = otherNumber[_min] 
};

(function() {
  

  this.max = function(maximum){
    const result = new this.constructor(this);
    result[_max] = maximum;
    return result
  }
  
  this.min = function(minimum){
    const result = new this.constructor(this);
    result[_min] = minimum;
    return result
  }
  
  this.integer = function(){
    const result = new this.constructor(this);
    result[_divisibleBy] = 1;
    return result
  }
  
  this.divisibleBy = function(num){
    const result = new this.constructor(this);
    result[_divisibleBy] = num;
    return result
  }
  
  this.validate = function(value){
    switch(true){
      case value === null:
        return this[_optional] ? {} : {error: `value = null is not a number` }; 
      case value === undefined:
        return this[_optional] ? {} : {error: `value = undefined is not a number` };
      case typeof value !== 'number':
        return {error: `value of type ${typeof value} is not a number` }; 
      case isNaN(value):
        return {error: `value is NaN, "not a number"` }; 
      case this[_max] < value:
        return {error: `number = ${value} is bigger than required maximum = ${this[_max]}` }; 
      case this[_min] > value:
        return {error: `number = ${value} is smaller than required minimum = ${this[_min]}` };
      case this[_divisibleBy] > 0 && value % this[_divisibleBy] !== 0:
        return {error: `number = ${value} is not divisible by = ${this[_divisibleBy]}` };
      default: return {};
    }
    
  }
  
  function isDivisibleSubset(sourceSchema, targetSchema){
    switch(true){
      case sourceSchema[_divisibleBy] === 0: return targetSchema[_divisibleBy] === 0
      case targetSchema[_divisibleBy] === 0: return true
      default: return sourceSchema[_divisibleBy] % targetSchema[_divisibleBy] === 0
    }
  }
  
  
  this.checkSubsetOf = function(targetSchema){
    switch(true){
      case !isDivisibleSubset(this, targetSchema):
        return {isSubset: false, reason: `source division check value = ${this[_divisibleBy]} is not divisible by target value = ${targetSchema[_divisibleBy]}` }; 
      case this[_max] > targetSchema[_max]:
        return {isSubset: false, reason: `target maximum value = ${targetSchema[_max]} is smaller than source value = ${this[_max]}` }; 
      case this[_min] < targetSchema[_min]:
        return {isSubset: false, reason: `target minimum value = ${targetSchema[_min]} is bigger than source value = ${this[_min]}` }; 
      default:
        return {isSubset: true};
    }
  }
  
  this.generateSequentialData = function*(options){
    const maxAmount = options.maxAmount
    const step = this[_divisibleBy] === 0 ? 0.1 : this[_divisibleBy];
    const baseStartingPoint = -maxAmount * step / 2.0
    const baseEndingPoint = maxAmount * step / 2.0
    const startingPoint = this[_min] == -Infinity ? baseStartingPoint : Math.max(this[_min],  baseStartingPoint)
    const endingPoint = this[_max] == Infinity ? baseEndingPoint : Math.min(this[_max],  baseEndingPoint)

    var value = baseStartingPoint
    for(let i = 0; value < endingPoint; ++i){
      value = (startingPoint + i * step);
      yield value
    }
  }
  
  
  this.generateRandomData = function*(options){
    const maxAmount = options.maxAmount
    const min = this[_min] == -Infinity ? Number.MIN_SAFE_INTEGER : this[_min] 
    const max = this[_max] == Infinity ? Number.MAX_SAFE_INTEGER : this[_max] 
    const diff = max - min
    const step = this[_divisibleBy];

    if(step === 0){
      for(let i = 0; i < maxAmount; ++i){
        yield Math.random() * diff + min 
      }
    } else {
      for(let i = 0; i < maxAmount; ++i){
        const randomNum = Math.random() * diff + min
        yield randomNum - (randomNum % step)
      }
    }
   

    
  }
}).call(NumberSchema.prototype);


const compose = (...args) =>  args.reduce((result, feature) => feature(result));
var ComposedNumberSchema = compose(NumberSchema, OptionalValueFeature, GeneratorOptionCleanFeature, BaseSubsetValidationFeature);
module.exports = new ComposedNumberSchema(initialValues);