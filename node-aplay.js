/**
 * Javascript ALSA aplay wrapper for Node.js
 *
 * @mantainedBy Rocco Musolino - @roccomuso
 * @author Patrik Melander (lotAballs) node-aplay module
 * @originalAuthor Maciej Sopyło @ KILLAHFORGE.
 *
 * Dependencies: sudo apt-get install alsa-base alsa-utils
 * MIT License
 */

var os = require('os')
var spawn = require('child_process').spawn
var events = require('events')
var util = require('util')

var aplayExec = os.platform() === 'darwin' ? 'afplay' : 'aplay'

function Sound (opts) {
  events.EventEmitter.call(this)
  opts = opts || {}
  this.channel = opts.channel || null
}

util.inherits(Sound, events.EventEmitter)

Sound.prototype.play = function (fileName) {
  this.stopped = false
  if (typeof this.process !== 'undefined') this.process.kill('SIGTERM') // avoid multiple play for the same istance
  var args = []
  if (this.channel) args = args.concat(['-c ' + this.channel])
  args = args.concat([fileName])
  this.process = spawn(aplayExec, args)
  var self = this
  this.process.on('exit', function (code, sig) {
    if (code !== null && sig === null) {
      self.emit('complete')
    }
  })
  return this
}
Sound.prototype.stop = function () {
  if (this.process) {
    this.stopped = true
    this.process.kill('SIGTERM')
    this.emit('stop')
  }
  return this
}
Sound.prototype.pause = function () {
  if (this.process) {
    if (this.stopped) return true
    this.process.kill('SIGSTOP')
    this.emit('pause')
  }
  return this
}
Sound.prototype.resume = function () {
  if (this.process) {
    if (this.stopped) return this.play()
    this.process.kill('SIGCONT')
    this.emit('resume')
  }
  return this
}
Sound.prototype.channel = function (ch) {
  this.channel = ch
  return this
}

module.exports = Sound

// autonomous execution: node node-aplay.js my-song.wav
if (!module.parent) {
  var player = new Sound()
  player.play(process.argv[2])
}
