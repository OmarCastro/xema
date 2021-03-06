/*
 * Feature - Generator option clean
 *
 * Guarantees that the options are valid before generating numbers
 */

const defaultMaximumAmountOfData = 10000

function cleanOptions (options) {
  if (typeof options !== 'object' || options == null) {
    return {maxAmount: defaultMaximumAmountOfData}
  } else {
    const maxAmount = Number.isNaN(Number(options.maxAmount)) ? defaultMaximumAmountOfData : options.maxAmount
    return {maxAmount}
  }
}

module.exports = {
  mixWith (factory) {
    const instanceProperties = factory.instanceProperties
    const baseGenerateRandomData = instanceProperties.generateRandomData
    instanceProperties.generateRandomData = function (options) {
      return baseGenerateRandomData.call(this, cleanOptions(options))
    }
    const baseGenerateSequentialData = instanceProperties.generateSequentialData
    if (typeof baseGenerateSequentialData === 'function') {
      instanceProperties.generateSequentialData = function (options) {
        return baseGenerateSequentialData.call(this, cleanOptions(options))
      }
    }
    return factory
  }
}
