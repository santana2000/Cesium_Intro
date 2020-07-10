const path = require('path')
var mypath = path.resolve('/src')
console.log(mypath)

let cesiumSource = './node_modules/cesium/Source'

var cpath = path.resolve(__dirname, cesiumSource)
console.log(cpath)
