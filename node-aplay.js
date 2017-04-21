/**
 * Javascript ALSA aplay wrapper for Node.js
 *
 * @mantainedBy Rocco Musolino - hackerstribe.com
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

function Sound () {
  events.EventEmitter.call(this)
}

util.inherits(Sound, events.EventEmitter)

Sound.prototype.play = function (fileName) {
  this.stopped = false
  if (typeof this.process !== 'undefined') this.process.kill('SIGTERM') // avoid multiple play for the same istance
  this.process = spawn(aplayExec, [ fileName ])
  var self = this
  this.process.on('exit', function (code, sig) {
    if (code !== null && sig === null) {
      self.emit('complete')
    }
  })
}
Sound.prototype.stop = function () {
  if (this.process) {
    this.stopped = true
    this.process.kill('SIGTERM')
    this.emit('stop')
  }
}
Sound.prototype.pause = function () {
  if (this.process) {
    if (this.stopped) return true
    this.process.kill('SIGSTOP')
    this.emit('pause')
  }
}
Sound.prototype.resume = function () {
  if (this.process) {
    if (this.stopped) return this.play()
    this.process.kill('SIGCONT')
    this.emit('resume')
  }
}

module.exports = Sound

// autonomous execution: node node-aplay.js my-song.wav
if (!module.parent) {
  var player = new Sound()
  player.play(process.argv[2])
}
