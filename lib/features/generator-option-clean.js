const maximumAmountOfData = 10000

function cleanOptions (options) {
  if (typeof options !== 'object' || options == null) {
    return {maxAmount: maximumAmountOfData}
  } else {
    const maxAmount = Number.isNaN(Number(options.maxAmount)) ? maximumAmountOfData : options.maxAmount
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
