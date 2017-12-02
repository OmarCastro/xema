
function defineExports(requirePathsMap){
    Object.keys(requirePathsMap).forEach(key => {
        Object.defineProperty(module.exports, key, {
            get: () => require(requirePathsMap[key])
        })
    })
}


defineExports({
    boolean: './basic-types/boolean',
    number: './basic-types/number',
    string: './basic-types/string',
    array: './components/array',
    object: './components/object'
});