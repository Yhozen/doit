var debug = require('debug')
var dragDrop = require('drag-drop')
var path = require('path')
var Peer = require('simple-peer')
var videostream = require('videostream')
let { currentPathId, state, peers, torrentData } = require('./states')
const { username, peerId, color } = require('./user') 
const { getClient } = require('./getClient')
const { canvas, setupCanvas, redraw } = require('./canvas')
const { tracker } = require('./tracker')
const { broadcast } = require('./broadcast')
const mouseEvents = require('./mouseEvents')

if (!Peer.WEBRTC_SUPPORT) {
  window.alert('This browser is unsupported. Please use a browser with WebRTC support.')
}

getClient(function (err, client) {
  if (err) return window.alert(err.message || err)
  window.client = client
})

// set canvas settings and size
setupCanvas()
window.addEventListener('resize', setupCanvas)

tracker.start()
mouseEvents.init()

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
