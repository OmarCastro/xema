const { OptionalValueFeature, BaseSubsetValidationFeature, GeneratorOptionCleanFeature, SchemaInstanceValidationFeature } = require('../features')

const _maxLength = Symbol('max length')
const _minLength = Symbol('min length')
const _optional = OptionalValueFeature.optionalSymbol
const _recordSchema = Symbol('record Validation')

const initialValues = {
  [_recordSchema]: null,
  [_maxLength]: Infinity,
  [_minLength]: 0
}

const ArraySchemaMaker = {
  buildSchema (otherSchema) {
    const obj = Object.create(this.instanceProperties)
    obj[_recordSchema] = otherSchema[_recordSchema]
    obj[_maxLength] = otherSchema[_maxLength]
    obj[_minLength] = otherSchema[_minLength]
    return obj
  },

  instanceProperties: {
    get info () {
      return {
        schemaName: 'ArraySchema',
        recordSchema: (this[_recordSchema] != null && this[_recordSchema].info) ? this[_recordSchema].info : null,
        maxLength: this[_maxLength],
        minLength: this[_minLength]
      }
    },

    maxLength (maximum) { return Object.assign(ArraySchemaMaker.buildSchema(this), { [_maxLength]: maximum }) },
    minLength (minimum) { return Object.assign(ArraySchemaMaker.buildSchema(this), { [_minLength]: minimum }) },
    'of' (schema) { return Object.assign(ArraySchemaMaker.buildSchema(this), { [_recordSchema]: schema }) },

    isSchemaValid () {
      const recordSchema = this[_recordSchema]
      const maxLength = this[_maxLength]
      const minLength = this[_minLength]

      let errors = []
      const isMaxAPositiveNumber = checkPropertyValueIsAPositiveNumber(maxLength, 'maximum length')
      const isMinAPositiveNumber = checkPropertyValueIsAPositiveNumber(minLength, 'minimum length')
      errors.push(isMaxAPositiveNumber)
      errors.push(isMinAPositiveNumber)
      if (isMaxAPositiveNumber.length === 0 && isMinAPositiveNumber.length === 0 && maxLength < minLength) {
        errors.push(`required minimum length = ${minLength} is greater than required maximum length = ${maxLength}`)
      }

      errors = errors.filter(error => error.length > 0)

      if (recordSchema != null) {
        if (typeof recordSchema.isSchemaValid === 'function') {
          let schemaValidation = recordSchema.isSchemaValid()
          if (schemaValidation.hasOwnProperty('errors')) {
            errors.push({schemaErrors: schemaValidation.errors})
          }
        } else {
          errors.push('recordSchema is not a schema')
        }
      }

      return errors.length === 0 ? {} : {errors}
    },

    validate (value) {
      switch (true) {
        case value === null:
          return this[_optional] ? {} : { error: `value = null is not an array` }
        case value === undefined:
          return this[_optional] ? {} : { error: `value = undefined is not an array` }
        case typeof value !== 'object':
          return { error: `value of type ${typeof value} is not an array` }
        case !Array.isArray(value) :
          return { error: `object value is not an array` }
        case this[_maxLength] < value.length:
          return { error: `array length = ${value.length} is bigger than required maximum = ${this[_maxLength]}` }
        case this[_minLength] > value.length:
          return { error: `array length = ${value.length} is smaller than required minimum = ${this[_minLength]}` }
        case this[_recordSchema] == null:
          return {}
      }

      const schema = this[_recordSchema]
      const error = value.map((record, index) => { return {error: schema.validate(record).error, index} })
        .filter((recordValidation) => recordValidation.error != null)

      return (error.length > 0) ? {error} : {}
    },

    checkSubsetOf (targetSchema) {
      switch (true) {
        case this[_maxLength] > targetSchema[_maxLength]:
          return { isSubset: false, reason: `target maximum length = ${targetSchema[_maxLength]} is smaller than source length = ${this[_maxLength]}` }
        case this[_minLength] < targetSchema[_minLength]:
          return { isSubset: false, reason: `target minimum length = ${targetSchema[_minLength]} is bigger than source length = ${this[_minLength]}` }
        case targetSchema[_recordSchema] == null:
          return {isSubset: true}
        case this[_recordSchema] == null:
          return { isSubset: false, reason: `source has no record schema while target has ${targetSchema[_recordSchema].info.schemaName}` }
      }

      const recordSubsetResult = this[_recordSchema].checkSubsetOf(targetSchema[_recordSchema])
      if (recordSubsetResult.isSubset === false) {
        recordSubsetResult.reason = `array record subset: ${recordSubsetResult.reason}`
      }
      return recordSubsetResult
    },

    * generateRandomData (options) {
      const maxAmount = options.maxAmount
      const minLength = this[_minLength] || 0
      const maxLength = isFinite(this[_maxLength]) ? this[_maxLength] : minLength + 10
      const generator = this[_recordSchema].generateRandomData({ maxAmount: Infinity })
      for (let i = 0; i < maxAmount; ++i) {
        const length = Math.floor(Math.random() * (maxLength - minLength)) + minLength
        const result = []
        for (let j = 0; j < length; j++) {
          result.push(generator.next().value)
        }
        yield result
      }
    }

  }
}

function checkPropertyValueIsAPositiveNumber (value, propertyDescription) {
  switch (true) {
    case value === null:
      return `${propertyDescription} is null`
    case value === undefined:
      return `${propertyDescription} is undefined`
    case typeof value !== 'number':
      return `${propertyDescription} of type "${typeof value}" is not a number`
    case value < 0:
      return `${propertyDescription} = ${value} must be a positive value`
    default:
      return ''
  }
}

const applyFeaturesOn = (factory, features) => features.forEach(feature => feature.mixWith(factory))
applyFeaturesOn(ArraySchemaMaker, [OptionalValueFeature, GeneratorOptionCleanFeature, SchemaInstanceValidationFeature, BaseSubsetValidationFeature])
module.exports = ArraySchemaMaker.buildSchema(initialValues)
