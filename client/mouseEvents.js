let { currentPathId, state, peers, torrentData } = require('./states')
const { color, hat } = require('./user')
const { canvas, redraw } = require('./canvas')
const { broadcast } = require('./broadcast')

const init = () => {
    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('touchstart', onDown)
    document.body.addEventListener('mouseup', onUp)
    document.body.addEventListener('touchend', onUp)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('touchmove', onMove)
}

module.exports = { init }

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

function onUp () {
  currentPathId = null
}

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