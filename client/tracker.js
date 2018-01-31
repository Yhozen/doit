var Tracker = require('bittorrent-tracker/client')
const { peerId } = require('./user')
let { peers } = require('./states')
const { _Peer } = require('./_Peer') 

var TRACKER_URL = 'wss://tracker.fastcast.nz'

global.WEBTORRENT_ANNOUNCE = [ TRACKER_URL ]

var tracker = new Tracker({
    peerId: peerId,
    announce: TRACKER_URL,
    infoHash: new Buffer(20).fill('webrtc-whiteboard')
})
  
tracker.on('peer', function (peer) {
    peers.push(peer)
    const Peer = new _Peer(peer)
    if (peer.connected) Peer.onConnect()
    else peer.once('connect', Peer.onConnect)
})

module.exports = { tracker }