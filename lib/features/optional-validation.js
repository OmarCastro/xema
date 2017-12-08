const _optional = Symbol("optional");

module.exports = Base => {
  class ComposedClass extends Base {
    constructor(otherSchema){
      super(otherSchema)
      this[_optional] = otherSchema[_optional] === true;
    }
    
    checkSubsetOf(targetSchema){
      if(this[_optional] === true && targetSchema[_optional] === false){
          return {isSubset: false, reason: `source schema allows null values while target does not` }; 
        }
      return super.checkSubsetOf(targetSchema)
    }
    
    optional(){
      const result = new this.constructor(this);
      result[_optional] = true;
      return result
    }
  }
  Object.defineProperty(ComposedClass, "name", { value: Base.name });
  return ComposedClass
}

module.exports.optionalSymbol = _optional
