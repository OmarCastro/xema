/*
 * Feature - Optional value validation
 *
 * Add schema options to allow null and undefined values
 */
const _optional = Symbol('optional')

module.exports = {
  optionalSymbol: _optional,
  mixWith (factory) {
    const instanceProperties = factory.instanceProperties
    const baseBuildSchema = factory.buildSchema

    factory.buildSchema = function (...args) {
      var obj = baseBuildSchema.apply(this, args)
      let otherSchema = args[0]
      obj[_optional] = otherSchema[_optional] === true
      return obj
    }

    const baseInfoProperty = Object.getOwnPropertyDescriptor(instanceProperties, 'info')
    const baseInfoGetter = baseInfoProperty.get
    baseInfoProperty.get = function () {
      return Object.assign(baseInfoGetter.call(this), {
        optional: this[_optional]
      })
    }
    Object.defineProperty(instanceProperties, 'info', baseInfoProperty)

    const baseCheckSubsetOf = instanceProperties.checkSubsetOf
    instanceProperties.checkSubsetOf = function (targetSchema) {
      if (this[_optional] === true && targetSchema[_optional] === false) {
        return { isSubset: false, reason: `source schema allows null values while target does not` }
      }
      return baseCheckSubsetOf.call(this, targetSchema)
    }

    instanceProperties.optional = function (targetSchema) {
      const result = factory.buildSchema(this)
      result[_optional] = true
      return result
    }

    return factory
  }
}
