const _maxLength = Symbol("max length")
const _minLength = Symbol("min length")
const _recordSchema = Symbol("record Validation")

var ArraySchema = function(otherNumber) {
    if(otherNumber == null){
      this[_recordSchema] = null
      this[_maxLength] = Infinity
      this[_minLength] = 0  
    } else {
      this[_recordSchema] = otherNumber[_recordSchema]
      this[_maxLength] = otherNumber[_maxLength]
      this[_minLength] = otherNumber[_minLength] 
    }
    
};

(function() {
    this.maxLength = function(maximum){
      const result = new ArraySchema(this);
      result[_maxLength] = maximum;
      return result
    }
    
    this.minLength = function(minimum){
      const result = new ArraySchema(this);
      result[_minLength] = Math.max(minimum, 0);
      return result
    }
    
    this.of = function(recordSchema){
      const result = new ArraySchema(this);
      result[_recordSchema] = recordSchema;
      return result
    }
    
    
    this.validate = function(value){
      switch(true){
        case value === null:
          return {error: `value is null` }; 
        case value === undefined:
          return {error: `value is undefined` }; 
        case typeof value !== 'object':
          return {error: `value of type ${typeof value} is not an array` }; 
        case !Array.isArray(value) :
          return {error: `object value is not an array` }; 
        case this[_maxLength] < value.length:
          return {error: `array length = ${value} is bigger than required maximum = ${this[_maxLength]}` }; 
        case this[_minLength] > value.length:
          return {error: `array length = ${value} is smaller than required minimum = ${this[_minLength]}` };
        case this[_recordSchema] == null:
          return {}
      }
      
      const schema = this[_recordSchema]
      const error = value.map((record, index) => {return {error: schema.validate(record).error, index}}).
        filter((recordValidation) => recordValidation.error != null)

      return ( error.length > 0 ) ? {error} : {}
    }
    
    this.isSubsetOf = function(other){
        return  this[_recordSchema] == null ?
                  this[_recordSchema] === other[_recordSchema] :
                  this[_recordSchema].isSubsetOf(other[_recordSchema]) &&
                this[_maxLength] <= other[_maxLength] &&
                this[_minLength] >= other[_minLength]
    }
}).call(ArraySchema.prototype);

module.exports = new ArraySchema();