const _optional = Symbol("optional");

const BooleanSchema = function(isOptional) {
      this[_optional] = isOptional;
};

(function() {
    this.optional = () => new BooleanSchema(true)
    
    this.validate = function(value){
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
      
    }
    
    this.checkSubsetOf = function(targetSchema){
      switch(true){
        case targetSchema instanceof BooleanSchema !== true: return {isSubset: false, reason: `not comparing with another BooleanSchema` }; 
        case this[_optional] === true && targetSchema[_optional] === false:
          return {isSubset: false, reason: `source schema allows null values while target does not` }; 
        default: return {isSubset: true};
      }
    }
    
    this.generateSequentialData = function*(){
        yield false
        yield true
    }
    
    this.generateRandomData = function*(options){
      options = options || {}
      const maxAmount = (options.maxAmount|0) || 10000
      for(let i = 0; i < maxAmount; ++i){
        yield Math.random() >= 0.5
      }
    }
    
}).call(BooleanSchema.prototype);

module.exports = new BooleanSchema(false);