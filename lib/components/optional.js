const _recordSchema = Symbol("record Validation")

var OptionalSchema = function(other) {
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
    
    this.isSubsetOf = function(other){
        return  this[_recordSchema] == null ?
                  this[_recordSchema] === other[_recordSchema] :
                  this[_recordSchema].isSubsetOf(other[_recordSchema]) &&
    }
}).call(OptionalSchema.prototype);


const basicSchema = new OptionalSchema();

const exportObj = (schema) => basicSchema.of(schema)
exportObj.of = (schema) => basicSchema.of(schema);
exportObj.validate = (value) => basicSchema.validate(value);
exportObj.isSubsetOf = (other) => basicSchema.isSubsetOf(other);

module.exports = exportObj