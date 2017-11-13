const _keys = Symbol("keys")
const _recordSchema = Symbol("record Validation")

var ObjectSchema = function(other) {
    if(other == null){
      this[_keys] = null  
    } else {
      this[_keys] = Object.assign({}, other[_keys]);
    }
    
};

(function() {

    this.keys = function(schema){
      const result = new ObjectSchema(this);
      result[_keys] = Object.assign({}, result[_keys], schema);;
      return result
    }
    
    this.validate = function(value){
      switch(true){
        case typeof value !== "object" : return {error: `value is not an object` }; 
        case this[_keys] == null: return {}
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
    
   this.checkSubsetOf = function(targetSchema){
     switch(true){
      case targetSchema instanceof ObjectSchema !== true:
        return {isSubset: false, reason: `not comparing with another ObjectSchema` }; 
      case !Object.keys(this[_keys]).every((key) => this[_keys][key].isSubsetOf( targetSchema[_keys][key])):
        return {isSubset: false, reason: `some keys are not a subset of other` }; 

    }
    
    
  }

}).call(ObjectSchema.prototype);

module.exports = new ObjectSchema();