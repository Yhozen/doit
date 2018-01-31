var Tracker = require('bittorrent-tracker/client')
const { color, peerId, username } = require('./user')
let { currentPathId, state, peers, torrentData } = require('./states')
const { redraw } = require('./canvas')

var TRACKER_URL = 'wss://tracker.fastcast.nz'

global.WEBTORRENT_ANNOUNCE = [ TRACKER_URL ]

var tracker = new Tracker({
    peerId: peerId,
    announce: TRACKER_URL,
    infoHash: new Buffer(20).fill('webrtc-whiteboard')
  })
  
  
tracker.on('peer', function (peer) {
    peers.push(peer)
  
    if (peer.connected) onConnect()
    else peer.once('connect', onConnect)
  
    function onConnect () {
      peer.on('data', onMessage)
      peer.on('close', onClose)
      peer.on('error', onClose)
      peer.on('end', onClose)
      peer.send(JSON.stringify({ username: username, color: color, state: state }))
  
      function onClose () {
        peer.removeListener('data', onMessage)
        peer.removeListener('close', onClose)
        peer.removeListener('error', onClose)
        peer.removeListener('end', onClose)
        peers.splice(peers.indexOf(peer), 1)
        redraw()
      }
  
      function onMessage (data) {
        try {
          data = JSON.parse(data)
        } catch (err) {
          console.error(err.message)
        }
        if (data.username) {
          peer.username = data.username
          peer.color = data.color
          redraw()
        }
  
        if (data.state) {
          Object.keys(data.state)
            .filter(function (id) {
              return !state[id]
            })
            .forEach(function (id) {
              state[id] = data.state[id]
            })
          redraw()
        }
  
        if (data.pt) {
          if (!state[data.i]) state[data.i] = { pts: [], color: data.color }
          state[data.i].pts.push(data.pt)
          redraw()
        }
  
        if (data.infoHash) {
          state[data.infoHash] = data
          redraw()
        }
      }
    }
})
module.exports = { tracker }