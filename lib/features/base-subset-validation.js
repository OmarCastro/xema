module.exports = {
  mixWith (factory) {
    const instanceProperties = factory.instanceProperties

    const baseCheckSubsetOf = instanceProperties.checkSubsetOf
    instanceProperties.checkSubsetOf = function (targetSchema) {
      if (targetSchema == null || targetSchema.info == null || targetSchema.info.schemaName == null) {
        return { isSubset: false, reason: `not comparing with another ` + this.info.schemaName }
      }
      if (this.info.schemaName !== targetSchema.info.schemaName) {
        return { isSubset: false, reason: `not comparing with another ` + this.info.schemaName }
      }
      return baseCheckSubsetOf.call(this, targetSchema)
    }

    return factory
  }
}
