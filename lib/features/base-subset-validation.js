function BaseSubsetValidationMixin(BaseClass){
  class ComposedClass extends BaseClass {
    constructor(otherSchema){
      super(otherSchema)
    }
    
    checkSubsetOf(targetSchema){
     if(!(targetSchema instanceof BaseClass)){
        return {isSubset: false, reason: `not comparing with another `+this.constructor.name }
      }
     return super.checkSubsetOf(targetSchema)
    }
  }
  Object.defineProperty(ComposedClass, "name", { value: BaseClass.name });
  return ComposedClass
}

module.exports = BaseSubsetValidationMixin;