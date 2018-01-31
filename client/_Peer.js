const { color, username } = require('./user')
let { state, peers } = require('./states')
const { redraw } = require('./canvas')

class _Peer {
    constructor(peer) {
      this.peer = peer
      this.onClose = this.onClose.bind(this)
      this.onConnect = this.onConnect.bind(this)
      this.onMessage = this.onMessage.bind(this)
    }
    onConnect () {
      const { peer, onMessage, onClose } = this
      peer.on('data', onMessage)
      peer.on('close', onClose)
      peer.on('error', onClose)
      peer.on('end', onClose)
      peer.send(JSON.stringify({ username: username, color: color, state: state }))
    }
    onClose () {
      const { peer, onMessage, onClose } = this
      peer.removeListener('data',  onMessage)
      peer.removeListener('close', onClose)
      peer.removeListener('error', onClose)
      peer.removeListener('end', onClose)
      peers.splice(peers.indexOf(peer), 1)
      redraw()
    }
    onMessage (data) {
      const { peer, onMessage, onClose } = this
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
module.exports = { _Peer }