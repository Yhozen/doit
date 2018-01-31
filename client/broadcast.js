let { peers } = require('./states')

function broadcast (obj) {
    peers.forEach(function (peer) {
      if (peer.connected) peer.send(JSON.stringify(obj))
    })
}
module.exports = { broadcast }