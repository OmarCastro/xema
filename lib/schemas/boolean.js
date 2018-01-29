const { OptionalValueFeature, BaseSubsetValidationFeature, GeneratorOptionCleanFeature, SchemaInstanceValidationFeature, SchemaValidationResultCacheFeature } = require('../features')
const _optional = OptionalValueFeature.optionalSymbol

const BooleanSchemaMaker = {
  buildSchema (...args) {
    return Object.create(this.instanceProperties)
  },

  instanceProperties: {
    get info () {
      return {
        schemaName: 'BooleanSchema'
      }
    },

    validate (value) {
      switch (true) {
        case value === null:
          return this[_optional] ? {} : { error: 'value = null is not a boolean' }
        case value === undefined:
          return this[_optional] ? {} : { error: 'value = undefined is not a boolean' }
        case typeof value !== 'boolean':
          return { error: `value of type ${typeof value} is not a boolean` }
        default:
          return {}
      }
    },

    checkSubsetOf (targetSchema) {
      return {isSubset: true}
    },

    * generateSequentialData () {
      yield false
      yield true
    },

    * generateRandomData (options) {
      const maxAmount = options.maxAmount
      for (let i = 0; i < maxAmount; ++i) {
        yield Math.random() >= 0.5
      }
    }
  }
}

const applyFeaturesOn = (factory, features) => features.forEach(feature => feature.mixWith(factory))
applyFeaturesOn(BooleanSchemaMaker, [OptionalValueFeature, GeneratorOptionCleanFeature, SchemaInstanceValidationFeature, SchemaValidationResultCacheFeature, BaseSubsetValidationFeature])
module.exports = BooleanSchemaMaker.buildSchema({})
