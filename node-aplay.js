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

var	spawn   = require('child_process').spawn,
    exec    = require('child_process').exec,
	  events  = require('events'),
	  util    = require('util');

module.exports = function Sound() {
	events.EventEmitter.call(this);
};

util.inherits(module.exports, events.EventEmitter);

module.exports.prototype.play = function (fileName) {
	this.stopped = false;
  if (typeof this.process !== 'undefined') this.process.kill('SIGTERM'); // avoid multiple play for the same istance
	this.process = spawn('aplay', [ fileName ]);
	var self = this;
	this.process.on('exit', function (code, sig) {
		if (code !== null && sig === null) {
			self.emit('complete');
		}
	});
};
module.exports.prototype.stop = function () {
  if (this.process){
	   this.stopped = true;
  	 this.process.kill('SIGTERM');
	   this.emit('stop');
  }
};
module.exports.prototype.pause = function () {
  if (this.process){
    if (this.stopped) return;
    this.process.kill('SIGSTOP');
	  this.emit('pause');
  }
};
module.exports.prototype.resume = function () {
  if (this.process){
	   if (this.stopped) return this.play();
	   this.process.kill('SIGCONT');
	   this.emit('resume');
  }
};

// autonomous execution: node node-aplay.js my-song.wav
if(!module.parent) {
    new module.exports()
        .play(process.argv[2]);
}
