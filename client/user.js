var catNames = require('cat-names')
var hat = require('hat')

module.exports = {
    hat,
    username: catNames.random(),
    color: 'rgb(' + hat(8, 10) + ',' + hat(8, 10) + ',' + hat(8, 10) + ')',
    peerId: new Buffer(hat(160), 'hex')
}
