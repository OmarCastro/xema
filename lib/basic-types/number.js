const _max = Symbol("max")
const _min = Symbol("min")
const _divisibleBy = Symbol("divisibleBy")

var NumberSchema = function(otherNumber) {
    if(otherNumber == null){
      this[_divisibleBy] = 0
      this[_max] = Infinity
      this[_min] = -Infinity  
    } else {
      this[_divisibleBy] = otherNumber[_divisibleBy]
      this[_max] = otherNumber[_max]
      this[_min] = otherNumber[_min] 
    }
    
};

(function() {
    this.max = function(maximum){
      const result = new NumberSchema(this);
      result[_max] = maximum;
      return result
    }
    
    this.min = function(minimum){
      const result = new NumberSchema(this);
      result[_min] = minimum;
      return result
    }
    
    this.integer = function(){
      const result = new NumberSchema(this);
      result[_divisibleBy] = 1;
      return result
    }
    
    this.divisibleBy = function(num){
      const result = new NumberSchema(this);
      result[_divisibleBy] = num;
      return result
    }
    
    this.validate = function(value){
      switch(true){
        case value === null:
          return {error: `value is null` }; 
        case value === undefined:
          return {error: `value is undefined` }; 
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
        case targetSchema instanceof NumberSchema !== true:
          return {isSubset: false, reason: `not comparing with another NumberSchema` }; 
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
      options = options || {}
      const maxAmount = options.maxAmount || 10000
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
}).call(NumberSchema.prototype);

module.exports = new NumberSchema();