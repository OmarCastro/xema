const _optional = Symbol("optional");


module.exports.optionalSymbol = _optional;

module.exports.applyTo = function(objectDefinition){
  const baseInit = objectDefinition.init || function(){};
  const baseCheckSubsetOf = objectDefinition.prototype.checkSubsetOf

  objectDefinition.init = function optionalInit(other){
    this[_optional] = other[_optional] === true;
    baseInit.call(this, other);
  }
  
  objectDefinition.prototype.checkSubsetOf = function(targetSchema){
    if(this[_optional] === true && targetSchema[_optional] === false){
      return {isSubset: false, reason: `source schema allows null values while target does not` }; 
    }
    return baseCheckSubsetOf.call(this, targetSchema)
  }

  objectDefinition.prototype.optional = function(){
    const result = new this.constructor(this);
    result[_optional] = true;
    return result
  }
  
  return objectDefinition
}