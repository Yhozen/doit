var catNames = require('cat-names')
var hat = require('hat')

var username = catNames.random()
// pick random stroke color
var color = 'rgb(' + hat(8, 10) + ',' + hat(8, 10) + ',' + hat(8, 10) + ')'
var peerId = new Buffer(hat(160), 'hex')

module.exports = {
    hat,
    username,
    color,
    peerId
}
