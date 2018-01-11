/*
 * Feature - Base subset validation
 * 
 * Validates if the target value is the same type of schema
 */
 
module.exports = {
  mixWith (factory) {
    const instanceProperties = factory.instanceProperties

    const baseCheckSubsetOf = instanceProperties.checkSubsetOf
    instanceProperties.checkSubsetOf = function (targetSchema) {
      switch(true){
        case targetSchema === null: 
          return { isSubset: false, reason: `target schema is null` }
        case targetSchema === undefined: 
          return { isSubset: false, reason: `target schema is undefined` }
        case typeof targetSchema !== typeof this:
          return { isSubset: false, reason: `target of type ${typeof targetSchema} is not a schema` }
        case targetSchema.info == null || targetSchema.info.schemaName == null:
          return { isSubset: false, reason: `target object is not a schema` }
        case this.info.schemaName !== targetSchema.info.schemaName:
          return { isSubset: false, reason: `${this.info.schemaName} cannot be a subset of ${targetSchema.info.schemaName}` }
      }
      return baseCheckSubsetOf.call(this, targetSchema)
    }

    return factory
  }
}
