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
        case value === null:
          return {error: `value is null` }; 
        case value === undefined:
          return {error: `value is undefined` }; 
        case typeof value !== 'object':
          return {error: `value of type ${typeof value} is not an object` }; 
        case Array.isArray(value) :
          return {error: `value is an array, expected an object` }; 
        case this[_keys] == null:
          return {}
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
      case targetSchema instanceof ObjectSchema !== true:
        return {isSubset: false, reason: `not comparing with another ObjectSchema` }; 
      case targetSchema[_keys] == null:
        return {isSubset: true }; 
      case this[_keys] == null:
        return {isSubset: false, reason: `source has no record schema map while target has map ${printSchemaMap(targetSchema)}` }; 
     }
    
     return isSubsetByKeys(this, targetSchema);
    
  }

}).call(ObjectSchema.prototype);

module.exports = new ObjectSchema();

