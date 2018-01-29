/*
 * Feature - Schema validation
 *
 * Return error on value validation, subset check and data generation when the schema is invalid
 */
const _errorCache = Symbol('error cache')

function deepFreeze (obj) {
  Object.getOwnPropertyNames(obj).forEach(name => {
    let prop = obj[name]
    if (prop != null && typeof prop === 'object') { deepFreeze(prop) }
  })
  return Object.freeze(obj)
}

module.exports = {
  mixWith (factory) {
    const instanceProperties = factory.instanceProperties
    const baseErrorProperty = Object.getOwnPropertyDescriptor(instanceProperties, 'errors')
    const baseErrorGetter = baseErrorProperty.get
    baseErrorProperty.get = function () {
      if (this[_errorCache] === undefined) {
        this[_errorCache] = deepFreeze(baseErrorGetter.call(this))
      }
      return this[_errorCache]
    }
    Object.defineProperty(instanceProperties, 'errors', baseErrorProperty)
    return factory
  }
}
