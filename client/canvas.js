// create canvas
var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')
document.body.appendChild(canvas)
const { color, peerId, username } = require('./user')
let { currentPathId, state, peers, torrentData } = require('./states')

module.exports = { canvas, setupCanvas, redraw }

function setupCanvas () {
    // calculate scale factor for retina displays
    var devicePixelRatio = window.devicePixelRatio || 1
    var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1
    var ratio = devicePixelRatio / backingStoreRatio
  
    // set canvas width and scale factor
    canvas.width = window.innerWidth * ratio
    canvas.height = window.innerHeight * ratio
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    ctx.scale(ratio, ratio)
  
    // set stroke options
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 4
  
    // set font options
    ctx.fillStyle = 'rgb(255,0,0)'
    ctx.font = '16px sans-serif'
    redraw()
  }

function redraw () {
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  
    // draw the current state
    Object.keys(state).forEach(function (id) {
      var data = state[id]
  
      // draw paths
      if (data.pts) {
        ctx.beginPath()
        ctx.strokeStyle = data.color
        data.pts.forEach(function (point, i) {
          if (i === 0) ctx.moveTo(point.x, point.y)
          else ctx.lineTo(point.x, point.y)
        })
        ctx.stroke()
      }
  
      // draw images/video/audio
      if (data.infoHash) {
        if (!torrentData[data.infoHash]) {
          torrentData[data.infoHash] = { complete: false }
          getClient(function (err, client) {
            if (err) return window.alert(err.message || err)
            client.download(data.infoHash, function (torrent) {
              var file = torrent.files[0]
              if (!file) return
              if (data.img) {
                file.getBuffer(function (err, buf) {
                  if (err) return console.error(err)
                  toImage(buf, function (err, img) {
                    if (err) return console.error(err)
                    torrentData[data.infoHash] = { complete: true, img: img }
                    redraw()
                  })
                })
              } else if (data.stream) {
                torrentData[data.infoHash] = {
                  complete: true,
                  stream: true,
                  file: file
                }
                redraw()
              }
            })
          })
        }
        if (torrentData[data.infoHash].complete) {
          if (torrentData[data.infoHash].img) {
            ctx.drawImage(
              torrentData[data.infoHash].img,
              data.pos.x - (data.width / 4), data.pos.y - (data.height / 4),
              data.width / 2, data.height / 2
            )
          } else if (torrentData[data.infoHash].stream) {
            console.log(torrentData[data.infoHash])
            var extname = path.extname(torrentData[data.infoHash].file.name)
            if (document.querySelector('#' + 'infoHash_' + data.infoHash)) return
            var media
            if (extname === '.mp4' || extname === '.m4v' || extname === '.webm') {
              media = document.createElement('video')
            } else if (extname === '.mp3') {
              media = document.createElement('audio')
            }
  
            media.style.left = (data.pos.x - 150) + 'px'
            media.style.top = (data.pos.y - 100) + 'px'
            media.id = 'infoHash_' + data.infoHash
            media.controls = true
            media.autoplay = true
            media.loop = true
            document.body.appendChild(media)
  
            var file = torrentData[data.infoHash].file
            if (extname === '.mp4' || extname === '.m4v') {
              videostream(file, media)
            } else {
              file.createReadStream().pipe(media)
            }
          }
        } else {
          ctx.fillStyle = 'rgb(210,210,210)'
          var width = data.width
          var height = data.height
          console.log(width, height)
          if (torrentData[data.infoHash].stream) {
            width = 240
            height = 135
          }
          ctx.fillRect(
            data.pos.x - (width / 4), data.pos.y - (height / 4),
            width / 2, height / 2
          )
        }
      }
    })
  
    // draw usernames
    peers.concat({ color: color, username: username })
      .filter(function (peer) {
        return !!peer.username
      })
      .forEach(function (peer, i) {
        ctx.fillStyle = peer.color
        ctx.fillText(peer.username, 20, window.innerHeight - 20 - (i * 20))
      })
  }