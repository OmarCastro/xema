const _recordSchema = Symbol("record Validation")

function OptionalSchema(other) {
    if(other == null){
      this[_recordSchema] = null
    } else {
      this[_recordSchema] = other[_recordSchema]
    }
    
};

(function() {
    
    this.of = function(recordSchema){
      const result = new OptionalSchema(this);
      result[_recordSchema] = recordSchema;
      return result
    }
    
    
    this.validate = function(value){
      switch(true){
        case value == null: return {}
        case this[_recordSchema] != null: return this[_recordSchema].validate(value)
      }
      return {}
    }
    
    this.checkSubsetOf = function(targetSchema){
       switch(true){
        case targetSchema instanceof OptionalSchema !== true && targetSchema !== exportObj:
          return {isSubset: false, reason: `not comparing with another OptionalSchema` }; 
        case targetSchema[_recordSchema] == null:
          return {isSubset: true};
        case this[_recordSchema] == null:
          return {isSubset: false, reason: `source has no record schema while target has ${targetSchema[_recordSchema].constructor.name}` }; 
      }
      
      const recordSubsetResult = this[_recordSchema].checkSubsetOf(targetSchema[_recordSchema])
      if(recordSubsetResult.isSubset === false ){
        recordSubsetResult.reason = `optional record subset: ${recordSubsetResult.reason}`;
      }
      return recordSubsetResult;
    }
}).call(OptionalSchema.prototype);


const basicSchema = new OptionalSchema();

const exportObj = (schema) => basicSchema.of(schema)
exportObj.of = (schema) => basicSchema.of(schema);
exportObj.validate = (value) => basicSchema.validate(value);
exportObj.checkSubsetOf = (other) => basicSchema.checkSubsetOf(other);

module.exports = exportObj