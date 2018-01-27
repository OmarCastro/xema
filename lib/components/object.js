const { OptionalValueFeature, BaseSubsetValidationFeature, GeneratorOptionCleanFeature, SchemaInstanceValidationFeature } = require('../features')

const _keys = Symbol('keys')
const _optional = OptionalValueFeature.optionalSymbol

const initialValues = {
  [_keys]: {}
}

const ObjectSchemaMaker = {
  buildSchema (otherSchema) {
    const obj = Object.create(this.instanceProperties)
    obj[_keys] = Object.assign({}, otherSchema[_keys])
    return obj
  },

  instanceProperties: {
    get info () {
      const schemas = this[_keys]
      return {
        schemaName: 'ObjectSchema',
        keys: Object.keys(schemas).reduce((res, key) => {
          res[key] = schemas[key].info
          return res
        }, {})
      }
    },

    keys (schema) {
      const result = ObjectSchemaMaker.buildSchema(this)
      result[_keys] = Object.assign({}, result[_keys], schema)
      return result
    },
    
    isSchemaValid () {
     const errors = Object.keys(this[_keys])
        .map((key) => { return {error: this[_keys][key].isSchemaValid().errors, key} })
        .filter((recordValidation) => recordValidation.error != null)
        .reduce((result, recordValidation) => {
          result[recordValidation.key] = recordValidation.error
          return result
        }, {})
        
      return Object.keys(errors).length === 0 ? {} : {errors: [errors]}
    },

    validate (value) {
      switch (true) {
        case value === null:
          return this[_optional] ? {} : { error: `value = null is not an object` }
        case value === undefined:
          return this[_optional] ? {} : { error: `value = undefined is not an object` }
        case typeof value !== 'object':
          return { error: `value of type ${typeof value} is not an object` }
        case Array.isArray(value) :
          return { error: `value is an array, expected an object` }
      }

      const error = Object.keys(this[_keys])
        .map((key) => { return {error: this[_keys][key].validate(value[key]).error, key} })
        .filter((recordValidation) => recordValidation.error != null)
        .reduce((result, recordValidation) => {
          result[recordValidation.key] = recordValidation.error
          return result
        }, {})

      return (Object.keys(error).length > 0) ? {error} : {}
    },

    checkSubsetOf (targetSchema) {
      switch (true) {
        case Object.keys(this[_keys]).length === 0:
          return { isSubset: true }
        case Object.keys(targetSchema[_keys]).length === 0:
          return { isSubset: false, reason: `target has no record schema map while source has map ${printSchemaMap(this)}` }
      }
      return isSubsetByKeys(this, targetSchema)
    },

    * generateRandomData (options) {
      const maxAmount = options.maxAmount
      const keyObjs = this[_keys]
      const keys = Object.keys(keyObjs)
      const generators = keys.reduce((prev, key) => {
        prev[key] = keyObjs[key].generateRandomData({maxAmoun: Infinity})
        return prev
      }, {})
      for (let i = 0; i < maxAmount; ++i) {
        yield keys.reduce((prev, key) => {
          prev[key] = generators[key].next().value
          return prev
        }, {})
      }
    }
  }
}

function printSchemaMap (targetSchema) {
  const keys = targetSchema[_keys]
  return `{ ${Object.keys(keys).map((key) => `${key}: ${keys[key].info.schemaName}`).join(', ')} }`
}

function isSubsetByKeys (sourceSchema, targetSchema) {
  const sourceKeys = sourceSchema[_keys]
  const targetKeys = targetSchema[_keys]
  var reasons = Object.keys(sourceKeys).reduce((array, key) => {
    var result = sourceKeys[key].checkSubsetOf(targetKeys[key])
    if (!result.isSubset) {
      result.reason = `${key}: ${JSON.stringify(result.reason)}`
      array.push(result)
    }
    return array
  }, [])

  if (reasons.length === 0) {
    return { isSubset: true }
  } else {
    return { isSubset: false, reason: `{ ${reasons.map((result) => result.reason).join(', ')} }` }
  }
}

const applyFeaturesOn = (factory, features) => features.forEach(feature => feature.mixWith(factory))
applyFeaturesOn(ObjectSchemaMaker, [OptionalValueFeature, GeneratorOptionCleanFeature, SchemaInstanceValidationFeature, BaseSubsetValidationFeature])
module.exports = ObjectSchemaMaker.buildSchema(initialValues)
