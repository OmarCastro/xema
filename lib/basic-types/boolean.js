
const BooleanSchema = function() {};

(function() {
    this.validate = function(value){
      switch(true){
        case value === null:
          return {error: `value is null` }; 
        case value === undefined:
          return {error: `value is undefined` };
        case typeof value !== 'boolean':
          return {error: `value of type ${typeof value} is not a boolean` }; 
        default:
          return {};
      }
      
    }
    
    this.checkSubsetOf = function(other){
      switch(true){
        case other instanceof BooleanSchema !== true: return {isSubset: false, reason: `not comparing with another BooleanSchema` }; 
        default: return {isSubset: true};
      }
    }
}).call(BooleanSchema.prototype);

module.exports = new BooleanSchema();