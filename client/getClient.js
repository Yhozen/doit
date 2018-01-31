var thunky = require('thunky')
var xhr = require('xhr')
var WebTorrent = require('webtorrent')
const { peerId } = require('./user')

var getClient = thunky(function (cb) {
  var client = new WebTorrent({ peerId })
  client.on('error', function (err) {
    window.alert(err.message || err)
  })
  client.on('warning', function (err) {
    console.error(err.message || err)
  })
  cb(null, client)
})


module.exports = {
    getClient: getClient
}