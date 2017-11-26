const _startsWith = Symbol("starts with");
const _endsWith = Symbol("ends with");
const _contains = Symbol("contains");
const _optional = Symbol("optional");
const _enum = Symbol("enum");

const initialValues = {
  [_startsWith] : null,
  [_endsWith]: null,
  [_contains]: null,
  [_enum]: null,  
  [_optional]: false  
}

var StringSchema = function(other) {
    this[_startsWith] = other[_startsWith];
    this[_endsWith] = other[_endsWith];
    this[_contains] = other[_contains];
    this[_enum] = other[_enum];
    this[_optional] = other[_optional];
};

(function() {
  
  this.optional = function(text){
      const result = new StringSchema(this);
      result[_optional] = true;
      return result
    }
  
    this.startsWith = function(text){
      const result = new StringSchema(this);
      result[_startsWith] = text;
      return result
    }
    
    this.endsWith = function(text){
      const result = new StringSchema(this);
      result[_endsWith] = text;
      return result
    }
    
    this.contains = function(text){
      const result = new StringSchema(this);
      result[_contains] = text;
      return result
    }
    
    this.oneOf = function(...enumValueList){
      const result = new StringSchema(this);
      result[_enum] = new Set(enumValueList);
      return result
    }
   
    
    this.validate = function(value){
      switch(true){
        case value === null:
          return this[_optional] ? {} : {error: `value = null is not a string` }; 
        case value === undefined:
          return this[_optional] ? {} : {error: `value = undefined is not a string` };
        case typeof value !== 'string':
          return {error: `value of type ${typeof value} is not a string` }; 
        case this[_startsWith] != null && !value.startsWith(this[_startsWith]): 
          return {error: `string = "${value}" does not start with "${this[_startsWith]}"` }; 
        case this[_endsWith] != null && !value.endsWith(this[_endsWith]): 
          return {error: `string = "${value}" does not end with "${this[_endsWith]}"` }; 
        case this[_contains] != null && !value.includes(this[_contains]): 
          return {error: `string = "${value}" does not contain text "${this[_contains]}"` }; 
        case this[_enum] != null && !this[_enum].has(value):
          return {error: `string = "${value}" does not match any of { ${[...this[_enum]].join(', ')} }` };
        default:
          return {};
      }
      
    }
    
    
    function isSubsetByStartStringCheck(sourceSchema, targetSchema){
      switch(true){
        case sourceSchema[_startsWith] == null: return sourceSchema[_startsWith] == targetSchema[_startsWith]
        case targetSchema[_startsWith] == null: return true
        default: return sourceSchema[_startsWith].toString() === targetSchema[_startsWith].toString()
      }
    }
    
    function isSubsetByEndStringCheck(sourceSchema, targetSchema){
      switch(true){
        case sourceSchema[_endsWith] == null: return sourceSchema[_endsWith] == targetSchema[_endsWith]
        case targetSchema[_endsWith] == null: return true
        default: return sourceSchema[_endsWith].toString() === targetSchema[_endsWith].toString()
      }
    }
    
    function isSubsetByStringContainsCheck(sourceSchema, targetSchema){
      switch(true){
        case sourceSchema[_contains] == null: return sourceSchema[_contains] == targetSchema[_contains]
        case targetSchema[_contains] == null: return true
        default: return sourceSchema[_contains].toString() === targetSchema[_contains].toString()
      }
    }
    
    function isSetSubset(sourceSet, targetSet) {
      if (sourceSet.size > targetSet.size) return false;
      for (let item of sourceSet){
        if(!targetSet.has(item)){
          return false;
        }
      } 
      return true;
    }
    
    this.checkSubsetOf = function(targetSchema){
      switch(true){
        case targetSchema instanceof StringSchema !== true:
          return {isSubset: false, reason: `not comparing with another StringSchema` }; 
        case this[_optional] === true && targetSchema[_optional] === false:
          return {isSubset: false, reason: `source schema allows null values while target does not` }; 
        case !isSubsetByStartStringCheck(this, targetSchema):
          return {isSubset: false, reason: `source startsWith value = "${this[_startsWith]}" is different than target value = "${targetSchema[_startsWith]}"` }; 
        case !isSubsetByEndStringCheck(this, targetSchema):
            return {isSubset: false, reason: `source endsWith value = "${this[_endsWith]}" is different than target value = "${targetSchema[_endsWith]}"` };
        case !isSubsetByStringContainsCheck(this, targetSchema):
            return {isSubset: false, reason: `source contains value = "${this[_contains]}" is different than target value = "${targetSchema[_contains]}"` };
        case targetSchema[_enum] == null:
            return {isSubset: true};
        case this[_enum] == null:
            return {isSubset: false, reason: `source does not have enum check while target has { ${[...targetSchema[_enum]].join(', ')} }`};
        case !isSetSubset(this[_enum], targetSchema[_enum]):
          return {isSubset: false, reason: `source enum = { ${[...this[_enum]].join(', ')} } is not a subset of target enum = { ${[...targetSchema[_enum]].join(', ')} }` };
        default: return {isSubset: true};
      }
      
      
      
    }
}).call(StringSchema.prototype);

module.exports = new StringSchema(initialValues);