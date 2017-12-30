const OptionalValueFeature = require('../features/optional-validation.js')
const BaseSubsetValidationFeature = require('../features/base-subset-validation.js')
const GeneratorOptionCleanFeature = require('../features/generator-option-clean')

const _startsWith = Symbol('starts with')
const _endsWith = Symbol('ends with')
const _contains = Symbol('contains')
const _optional = OptionalValueFeature.optionalSymbol
const _enum = Symbol('enum')

const initialValues = {
  [_startsWith]: null,
  [_endsWith]: null,
  [_contains]: null,
  [_enum]: null
}

const StringSchemaMaker = {
  buildSchema (otherSchema) {
    const obj = Object.create(this.instanceProperties)
    obj[_startsWith] = otherSchema[_startsWith]
    obj[_endsWith] = otherSchema[_endsWith]
    obj[_contains] = otherSchema[_contains]
    obj[_enum] = otherSchema[_enum]
    return obj
  },

  instanceProperties: {
    get info () {
      return {
        schemaName: 'StringSchema'
      }
    },

    startsWith (text) { return Object.assign(StringSchemaMaker.buildSchema(this), { [_startsWith]: text }) },
    endsWith (text) { return Object.assign(StringSchemaMaker.buildSchema(this), { [_endsWith]: text }) },
    contains (num) { return Object.assign(StringSchemaMaker.buildSchema(this), { [_contains]: num }) },
    oneOf (...enumVals) { return Object.assign(StringSchemaMaker.buildSchema(this), { [_enum]: new Set(enumVals) }) },

    validate (value) {
      switch (true) {
        case value === null:
          return this[_optional] ? {} : { error: `value = null is not a string` }
        case value === undefined:
          return this[_optional] ? {} : { error: `value = undefined is not a string` }
        case typeof value !== 'string':
          return { error: `value of type ${typeof value} is not a string` }
        case this[_startsWith] != null && !value.startsWith(this[_startsWith]):
          return { error: `string = "${value}" does not start with "${this[_startsWith]}"` }
        case this[_endsWith] != null && !value.endsWith(this[_endsWith]):
          return { error: `string = "${value}" does not end with "${this[_endsWith]}"` }
        case this[_contains] != null && !value.includes(this[_contains]):
          return { error: `string = "${value}" does not contain text "${this[_contains]}"` }
        case this[_enum] != null && !this[_enum].has(value):
          return { error: `string = "${value}" does not match any of { ${[...this[_enum]].join(', ')} }` }
        default:
          return {}
      }
    },

    checkSubsetOf (targetSchema) {
      switch (true) {
        case !isSubsetByStartStringCheck(this, targetSchema):
          return { isSubset: false, reason: `source startsWith value = "${this[_startsWith]}" is different than target value = "${targetSchema[_startsWith]}"` }
        case !isSubsetByEndStringCheck(this, targetSchema):
          return { isSubset: false, reason: `source endsWith value = "${this[_endsWith]}" is different than target value = "${targetSchema[_endsWith]}"` }
        case !isSubsetByStringContainsCheck(this, targetSchema):
          return { isSubset: false, reason: `source contains value = "${this[_contains]}" is different than target value = "${targetSchema[_contains]}"` }
        case targetSchema[_enum] == null:
          return { isSubset: true }
        case this[_enum] == null:
          return { isSubset: false, reason: `source does not have enum check while target has { ${[...targetSchema[_enum]].join(', ')} }` }
        case !isSetSubset(this[_enum], targetSchema[_enum]):
          return { isSubset: false, reason: `source enum = { ${[...this[_enum]].join(', ')} } is not a subset of target enum = { ${[...targetSchema[_enum]].join(', ')} }` }
        default: return { isSubset: true }
      }
    },

    * generateSequentialData (options) {
      if (this[_enum] != null) {
        for (let val of generateSequentialEnumData.call(this, options)) { yield val }
      } else {
        for (let val of generateSequentialAnyTextData.call(this, options)) { yield val }
      }
    },

    * generateRandomData (options) {
      if (this[_enum] != null) {
        for (let val of generateRandomEnumData.call(this, options)) { yield val }
      } else {
        for (let val of generateRandomAnyTextData.call(this, options)) { yield val }
      }
    }
  }
}

function isSubsetByStartStringCheck (sourceSchema, targetSchema) {
  switch (true) {
    case sourceSchema[_startsWith] == null: return sourceSchema[_startsWith] === targetSchema[_startsWith]
    case targetSchema[_startsWith] == null: return true
    default: return sourceSchema[_startsWith].toString() === targetSchema[_startsWith].toString()
  }
}

function isSubsetByEndStringCheck (sourceSchema, targetSchema) {
  switch (true) {
    case sourceSchema[_endsWith] == null: return sourceSchema[_endsWith] === targetSchema[_endsWith]
    case targetSchema[_endsWith] == null: return true
    default: return sourceSchema[_endsWith].toString() === targetSchema[_endsWith].toString()
  }
}

function isSubsetByStringContainsCheck (sourceSchema, targetSchema) {
  switch (true) {
    case sourceSchema[_contains] == null: return sourceSchema[_contains] === targetSchema[_contains]
    case targetSchema[_contains] == null: return true
    default: return sourceSchema[_contains].toString() === targetSchema[_contains].toString()
  }
}

function isSetSubset (sourceSet, targetSet) {
  if (sourceSet.size > targetSet.size) return false
  for (let item of sourceSet) {
    if (!targetSet.has(item)) {
      return false
    }
  }
  return true
}

/// /////////////// BASE CHARACTER LIST //////////////////
const baseAlphabet = 'abcdefghijklmnopqrstuvwxyz'
const baseUpperCaseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const numbers = '0123456789'
const space = ' \t'
const newline = '\n'
const symbols = "\"#$%&'()*+,-./:;<=>?@[\\]^_`"
const extendedAlphabet = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž'
const greekAlphabet = 'αβγδεζηθικλμνξοπρστυφχψω'
const greekUpperCaseAlphabet = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'
const hiraganaCharacters = 'かきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆ𛀁よらりるれろわゐゔゑをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ'
/// /////////////// BASE CHARACTER LIST END //////////////////

/// /////////////// MIXED CHARACTER LIST //////////////////
const aplhaNumeric = baseAlphabet + baseUpperCaseAlphabet + numbers
const charactersForGenerator = aplhaNumeric +
                              space +
                              newline +
                              symbols +
                              extendedAlphabet +
                              greekAlphabet +
                              greekUpperCaseAlphabet +
                              hiraganaCharacters
/// /////////////// MIXED CHARACTER LIST END //////////////////

function * generateSequentialEnumData () {
  for (let enumValue of this[_enum]) {
    yield enumValue
  }
};

function * generateSequentialAnyTextData (options) {
  const maxAmount = options.maxAmount
  const prefix = this[_startsWith] || ''
  const postfix = this[_endsWith] || ''
  const midfix = this[_contains] || ''
  for (let i = 0; i < maxAmount; ++i) {
    const midleftChar = charactersForGenerator.charAt(Math.floor(i / charactersForGenerator.length))
    const midrightChar = charactersForGenerator.charAt(i % charactersForGenerator.length)
    yield prefix + midleftChar + midfix + midrightChar + postfix
  }
};

function * generateRandomEnumData (options) {
  const enumList = Array.from(this[_enum])
  const maxAmount = options.maxAmount
  for (let i = 0; i < maxAmount; ++i) {
    yield enumList[Math.floor(Math.random() * enumList.length)]
  }
};

function * generateRandomAnyTextData (options) {
  const maxAmount = options.maxAmount
  const prefix = this[_startsWith] || ''
  const postfix = this[_endsWith] || ''
  const midfix = this[_contains] || ''
  for (let i = 0; i < maxAmount; ++i) {
    const midleftChar = charactersForGenerator.charAt(Math.floor(Math.random() * charactersForGenerator.length))
    const midrightChar = charactersForGenerator.charAt(Math.floor(Math.random() * charactersForGenerator.length))
    yield prefix + midleftChar + midfix + midrightChar + postfix
  }
};

const applyFeaturesOn = (factory, features) => features.forEach(feature => feature.mixWith(factory))
applyFeaturesOn(StringSchemaMaker, [OptionalValueFeature, GeneratorOptionCleanFeature, BaseSubsetValidationFeature])
module.exports = StringSchemaMaker.buildSchema(initialValues)
