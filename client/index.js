var debug = require('debug')
var dragDrop = require('drag-drop')
var path = require('path')
var Peer = require('simple-peer')
var videostream = require('videostream')
const { username, hat, peerId, color } = require('./user') 
const { getClient } = require('./getClient')

if (!Peer.WEBRTC_SUPPORT) {
  window.alert('This browser is unsupported. Please use a browser with WebRTC support.')
}

getClient(function (err, client) {
  if (err) return window.alert(err.message || err)
  window.client = client
})

let { currentPathId, state, peers, torrentData } = require('./states')

const { canvas, setupCanvas, redraw } = require('./canvas')

// set canvas settings and size
setupCanvas()
window.addEventListener('resize', setupCanvas)

function broadcast (obj) {
  peers.forEach(function (peer) {
    if (peer.connected) peer.send(JSON.stringify(obj))
  })
}

canvas.addEventListener('mousedown', onDown)
canvas.addEventListener('touchstart', onDown)

function onDown (e) {
  e.preventDefault()
  currentPathId = hat(80)
  var x = e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageX) || 0
  var y = e.clientY || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageY) || 0
  var p1 = { x: x, y: y }
  var p2 = {
    x: x + 0.001,
    y: y + 0.001
  } // paint point on click

  state[currentPathId] = { color: color, pts: [ p1, p2 ] }
  broadcast({ i: currentPathId, pt: p1, color: color })
  broadcast({ i: currentPathId, pt: p2 })
  redraw()
}

document.body.addEventListener('mouseup', onUp)
document.body.addEventListener('touchend', onUp)

function onUp () {
  currentPathId = null
}

canvas.addEventListener('mousemove', onMove)
canvas.addEventListener('touchmove', onMove)

function onMove (e) {
  var x = e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageX) || 0
  var y = e.clientY || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageY) || 0
  if (currentPathId) {
    var pt = { x: x, y: y }
    state[currentPathId].pts.push(pt)
    broadcast({ i: currentPathId, pt: pt })
    redraw()
  }
}
const { tracker } = require('./tracker')
tracker.start()

dragDrop('body', function (files, pos) {
  getClient(function (err, client) {
    if (err) return window.alert(err.message || err)
    client.seed(files[0], function (torrent) {
      if (/.webm|.mp4|.m4v|.mp3$/.test(files[0].name)) {
        var message = {
          stream: true,
          infoHash: torrent.infoHash,
          pos: pos
        }
        broadcast(message)
        state[torrent.infoHash] = message
        torrentData[torrent.infoHash] = {
          complete: true,
          stream: true,
          file: torrent.files[0]
        }
        redraw()
      } else if (/.jpg|.png|.gif$/.test(files[0].name)) {
        toImage(files[0], function (err, img) {
          if (err) return console.error(err)
          var message = {
            img: true,
            infoHash: torrent.infoHash,
            pos: pos,
            width: img.width,
            height: img.height
          }
          broadcast(message)
          state[torrent.infoHash] = message
          torrentData[torrent.infoHash] = {
            complete: true,
            img: img
          }
          redraw()
        })
      }
    })
  })
})

function toImage (buf, cb) {
  var blob = Buffer.isBuffer(buf)
    ? new window.Blob([ buf ])
    : buf
  var img = new window.Image()
  img.src = window.URL.createObjectURL(blob)
  img.onload = function () { cb(null, img) }
  img.onerror = function (err) { cb(err) }
}

var ua = navigator.userAgent.toLowerCase()
if (ua.indexOf('android') > -1) {
  document.body.className = 'android'
}
