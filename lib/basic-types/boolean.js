const _startsWith = Symbol("starts with");
const _endsWith = Symbol("ends with");
const _contains = Symbol("contains");
const _enum = Symbol("enum");

var StringSchema = function(other) {
    if(other == null){
      this[_startsWith] = null;
      this[_endsWith] = null;
      this[_contains] = null;
      this[_enum] = null;
    } else {
      this[_startsWith] = other[_startsWith];
      this[_endsWith] = other[_endsWith];
      this[_contains] = other[_contains];
      this[_enum] = other[_enum] != null ? [...other[_enum]] : null;
    }
    
};

(function() {
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
    
    this.oneOf = function(enumValueList){
      const result = new StringSchema(this);
      result[_enum] = enumValueList;
      return result
    }
   
    
    this.validate = function(value){
      switch(true){
        case value === null:
          return {error: `value is null` }; 
        case value === undefined:
          return {error: `value is undefined` };
        case typeof value !== 'string':
          return {error: `value of type ${typeof value} is not a string` }; 
        case this[_startsWith] != null && !value.startsWith(this[_startsWith]): 
          return {error: `string = ${value} does not start with "${this[_startsWith]}"` }; 
        case this[_endsWith] != null && !value.endsWith(this[_endsWith]): 
          return {error: `string = ${value} does not end with "${this[_endsWith]}"` }; 
        case this[_contains] != null && !value.includes(this[_contains]): 
          return {error: `string = ${value} does not contain text "${this[_contains]}"` }; 
        case this[_enum] != null && this[_enum].indexOf(value) < 0:
          return {error: `string = ${value} does not match any of ${JSON.stringify(this[_enum])}` };
        default:
          return {};
      }
      
    }
    
    this.isSubsetOf = function(other){
      var self = this
      const isStartsWithSubsetOf = (() => { switch(true){
        case self[_startsWith] == null: return self[_startsWith] == other[_startsWith]
        case other[_startsWith] == null: return true
        default: self[_startsWith].toString() === other[_startsWith].toString()
      }}) 
      
      const isEnumSubsetOf = (() => { switch(true){
        case self[_enum] == null: return self[_enum] == other[_enum]
        case other[_enum] == null: return true
        default: self[_enum].every(_ => other[_enum].indexOf(_) >= 0)
      }})
      
      
        return  isStartsWithSubsetOf() && isEnumSubsetOf();
    }
}).call(StringSchema.prototype);

module.exports = new StringSchema();