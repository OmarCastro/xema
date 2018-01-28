/*
 * Feature - Schema validation
 *
 * Return error on value validation, subset check and data generation when the schema is invalid
 */
const _errorCache = Symbol('error cache')
const _hasErrorCache = Symbol('has error cache')

function applyValidationOnSubsetCheck (instanceProperties) {
  const baseCheckSubsetOf = instanceProperties.checkSubsetOf
  instanceProperties.checkSubsetOf = function (targetSchema) {
    var isSourceSchemaInvalid = this.hasErrors
    var isTargetSchemaInvalid = targetSchema.hasErrors
    switch (true) {
      case isSourceSchemaInvalid && isTargetSchemaInvalid:
        return { isSubset: false, reason: 'source and target schemas are invalid' }
      case isSourceSchemaInvalid:
        return { isSubset: false, reason: 'source schema is invalid' }
      case isTargetSchemaInvalid:
        return { isSubset: false, reason: 'target schema is invalid' }
      default:
        return baseCheckSubsetOf.call(this, targetSchema)
    }
  }
}

function applyValidationOnValueCheck (instanceProperties) {
  const baseValidate = instanceProperties.validate
  instanceProperties.validate = function (value) {
    if (this.hasErrors) {
      return { error: `schema is invalid` }
    }
    return baseValidate.call(this, value)
  }
}

function * emptyGenerator () {}

function applyValidationDataGeneration (instanceProperties) {
  const baseGenerateRandomData = instanceProperties.generateRandomData
  instanceProperties.generateRandomData = function (options) {
    if (this.hasErrors) {
      return emptyGenerator.call(this)
    }
    return baseGenerateRandomData.call(this, options)
  }
  const baseGenerateSequentialData = instanceProperties.generateSequentialData
  if (typeof baseGenerateSequentialData === 'function') {
    instanceProperties.generateSequentialData = function (options) {
      if (this.hasErrors) {
        return emptyGenerator.call(this)
      }
      return baseGenerateSequentialData.call(this, options)
    }
  }
}

function copyError(error){
  if (Array.isArray(error)) { return error.map(value => copyError(value)) }
  if (typeof error === "object") { 
    return Object.keys(error).reduce((result, key) => {
      result[key] = copyError(error[key])
      return result
    }, {})
  }
  return error
}
      

module.exports = {
  mixWith (factory) {
    const instanceProperties = factory.instanceProperties

    const baseErrorProperty = Object.getOwnPropertyDescriptor(instanceProperties, 'errors')

    if (baseErrorProperty && baseErrorProperty.get) {
      applyValidationOnSubsetCheck(instanceProperties)
      applyValidationOnValueCheck(instanceProperties)
      applyValidationDataGeneration(instanceProperties)
      
     
      const baseErrorGetter = baseErrorProperty.get
      baseErrorProperty.get = function(){
         if(this[_errorCache] === undefined){
           this[_errorCache] = baseErrorGetter.call(this)
         }
         return this[_errorCache].map(copyError)
      }
      Object.defineProperty(instanceProperties, 'errors', baseErrorProperty)
    } else {
      Object.defineProperty(instanceProperties, 'errors', {
        get(){ return [] }
      })
    }
    Object.defineProperty(instanceProperties, 'hasErrors', {
      get(){ return this[_errorCache] ? this[_errorCache].length > 0 : this.errors.length > 0}
    })
    

    return factory
  }
}
