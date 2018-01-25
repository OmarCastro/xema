/*
 * Feature - Schema validation
 *
 * Return error on value validation, subset check and data generation when the schema is invalid
 */
//const _isValidSchema = Symbol('is valid schema')

function applyValidationOnSubsetCheck(instanceProperties){
   const baseCheckSubsetOf = instanceProperties.checkSubsetOf
      instanceProperties.checkSubsetOf = function (targetSchema) {
        if (!this.isSchemaValid()) {
          return { isSubset: false, reason: `source schema is invalid` }
        }
        return baseCheckSubsetOf.call(this, targetSchema)
      }
}

function applyValidationOnValueCheck(instanceProperties){
   const baseValidate = instanceProperties.validate
      instanceProperties.validate = function (value) {
        if (!this.isSchemaValid()) {
          return { error: `schema is invalid` }
        }
        return baseValidate.call(this, value)
      }
}

function *emptyGenerator(){}

function applyValidationDataGeneration(instanceProperties){
   const baseGenerateRandomData = instanceProperties.generateRandomData
    instanceProperties.generateRandomData = function (options) {
      if (!this.isSchemaValid()) {
        return emptyGenerator.call(this)
      }
      return baseGenerateRandomData.call(this, options)
    }
    const baseGenerateSequentialData = instanceProperties.generateSequentialData
    if (typeof baseGenerateSequentialData === 'function') {
      instanceProperties.generateSequentialData = function (options) {
        if (!this.isSchemaValid()) {
          return emptyGenerator.call(this)
        }
        return baseGenerateSequentialData.call(this, options)
      }
    }
}


module.exports = {
  mixWith (factory) {
    const instanceProperties = factory.instanceProperties

    if (typeof instanceProperties.isSchemaValid !== 'function') {
      instanceProperties.isSchemaValid = () => true
    } else {
     applyValidationOnSubsetCheck(instanceProperties)
     applyValidationOnValueCheck(instanceProperties)
     applyValidationDataGeneration(instanceProperties)
    }

    return factory
  }
}
