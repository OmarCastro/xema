const maximumAmountOfData = 10000

function RandomGeneratorOptionCleanMixin(BaseClass){
  class ComposedClass extends BaseClass {
    constructor(otherSchema){
      super(otherSchema)
    }
    
    generateRandomData(options){
     return super.generateRandomData(cleanOptions(options))
    }
  }
  
  if(typeof BaseClass.prototype.generateSequentialData === "function"){
    ComposedClass.prototype.generateSequentialData = function(options){
      return BaseClass.prototype.generateSequentialData.call(this, cleanOptions(options))
    }
  }
  
  function cleanOptions(options){
      if(typeof options != "object" || options == null){
        return {maxAmount : maximumAmountOfData}
      } else {
        const maxAmount = Number.isNaN(Number(options.maxAmount)) ? maximumAmountOfData : options.maxAmount
        return {maxAmount}
      }
  }
  
  Object.defineProperty(ComposedClass, "name", { value: BaseClass.name });
  return ComposedClass
}

module.exports =  RandomGeneratorOptionCleanMixin;