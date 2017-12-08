module.exports = Base => {
  class ComposedClass extends Base {
    constructor(otherSchema){
      super(otherSchema)
    }
    
    checkSubsetOf(targetSchema){
     if(!(targetSchema instanceof Base)){
        return {isSubset: false, reason: `not comparing with another `+this.constructor.name }
      }
     return super.checkSubsetOf(targetSchema)
    }
  }
  Object.defineProperty(ComposedClass, "name", { value: Base.name });
  return ComposedClass
}