var thunky = require('thunky')
var xhr = require('xhr')
var WebTorrent = require('webtorrent')
const { peerId } = require('./user')

var getClient = thunky(function (cb) {
    xhr('http://localhost:9100/rtcConfig', function (err, res) {
      var rtcConfig
      if (err || res.statusCode !== 200) {
        window.alert('Could not get WebRTC config from server. Using default (without TURN).')
      } else {
        try {
          rtcConfig = JSON.parse(res.body)
        } catch (err) {
          window.alert('Got invalid WebRTC config from server: ' + res.body)
        }
        if (rtcConfig) debug('got rtc config: %o', rtcConfig)
      }
  
      var client = new WebTorrent({ peerId: peerId, rtcConfig: rtcConfig })
      client.on('error', function (err) {
        window.alert(err.message || err)
      })
      client.on('warning', function (err) {
        console.error(err.message || err)
      })
      cb(null, client)
    })
  })


module.exports = {
    getClient: getClient
}