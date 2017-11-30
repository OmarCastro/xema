
module.exports.applyTo = function(objectDefinition){
  const typeName = objectDefinition.name
  const baseCheckSubsetOf = objectDefinition.prototype.checkSubsetOf
  
  objectDefinition.prototype.checkSubsetOf = function(targetSchema){
    if(!(targetSchema instanceof objectDefinition)){
      return {isSubset: false, reason: `not comparing with another `+typeName }
    }
    return baseCheckSubsetOf.call(this, targetSchema)
  }
  
  return objectDefinition
}