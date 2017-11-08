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
      result[_divisibleBy] = num | 0;
      return result
    }
    
    this.validate = function(value){
      switch(true){
        case value === null: return {error: `value is null` }; 
        case value === undefined: return {error: `value is undefined` }; 
        case typeof value !== 'number': return {error: `value of type ${typeof value} is not a number` }; 
        case isNaN(value): return {error: `value is NaN, "not a number"` }; 
        case this[_max] < value: return {error: `number = ${value} is bigger than required maximum = ${this[_max]}` }; 
        case this[_min] > value: return {error: `number = ${value} is smaller than required minimum = ${this[_min]}` };
        case this[_divisibleBy] > 0 && value % this[_divisibleBy] !== 0: return {error: `number = ${value} is not divisible by = ${this[_divisibleBy]}` };
        default: return {};
      }
      
    }
    
    this.checkSubsetOf = function(other){
      
      const isDivisibleSubsetOf = (() => { switch(true){
        case this[_divisibleBy] === 0: return other[_divisibleBy] === 0
        case other[_divisibleBy] === 0: return true
        default: return this[_divisibleBy] % other[_divisibleBy] === 0
      }})
      
      switch(true){
        case other instanceof NumberSchema !== true: return {isSubset: false, reason: `not comparing with another NumberSchema` }; 
        case !isDivisibleSubsetOf(): return {isSubset: false, reason: `division check of expected value ${this[_divisibleBy]} is not divisible by other value = ${other[_divisibleBy]}` }; 
        case this[_max] > other[_max]: return {isSubset: false, reason: `maximum value ${other[_max]} is smaller than expected ${this[_max]}` }; 
        case this[_min] < other[_min]: return {isSubset: false, reason: `minimum value ${other[_min]} is bigger than expected ${this[_min]}` }; 
        default: return {isSubset: true};
      }
       
    }
}).call(NumberSchema.prototype);

module.exports = new NumberSchema();