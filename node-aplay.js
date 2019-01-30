#!/usr/bin/env node
/**
 * Javascript ALSA aplay wrapper for Node.js
 *
 * @author Martin Hammerchmidt, Yellow Innovation
 * @mantainedBy Rocco Musolino - @roccomuso
 * @author Patrik Melander (lotAballs) node-aplay module
 * @originalAuthor Maciej Sopyło @ KILLAHFORGE.
 *
 * Dependencies: sudo apt-get install alsa-base alsa-utils
 * MIT License
 */

const os = require('os');
const {spawn} = require('child_process');
const EventEmitter = require('events');

const aplayExec = os.platform() === 'darwin' ? 'afplay' : 'aplay';

/**
 * Aplay let you play WAV files through aplay spawned as a process.
 *
 * To debug playback errors, you can set the `NODE_APLAY_DEBUG` environment
 * variable. It will pipe `stdout` and `stderr` from `aplay` process to node.
 *
 * Aplay extends EventEmitter. List of events emitted:
 *
 * - `complete`: emitted when the played file complete its playback.
 * - `stop`: emitted when the playback stopped on a call of `stop()`.
 * - `pause`: emitted when the playback paused on a call of `pause()`.
 * - `resume`: emitted when the playback resume after being paused on a call of
 *   `resume()`.
 * - `error`: emitted when aplay exited unexpectedly. Most common causes are
 *    wrong filename or the audio device busy.
 */
class Aplay extends EventEmitter
{
    /**
     * @param {Object} [options] Various options
     * @param {?Number=} options.channels Number of channels [1;32]. Pass `null`
     *  to default to aplay defaults.
     */
    constructor(options)
    {
        super();
        this.process = null;
        this.paused = false;

        options = options || {};
        const channels = options.channels || null;
        this.channels(channels);
    }

    /**
     * Play a WAV file
     * @param {String} filename WAV file to play
     * @return {Aplay} return this instance
     */
    play(filename)
    {
        if (typeof filename !== 'string')
        {
            throw new TypeError('filename must be a string.');
        }

        if (this.process)
        {
            this.process.kill('SIGKILL');
            this.process = null;
            this.paused = false;
        }

        const args = [];

        if (this._channels)
        {
            args.push('-c ' + this._channels);
        }

        args.push(filename);

        this.process = spawn(aplayExec, args);

        this.process.on('exit', (code, sig) =>
        {
            this.stopped = true;

            if (code === 0 && sig === null)
            {
                this.emit('complete');
            }
            else
            {
                this.emit('error', code, sig);
            }
        });

        if (process.env.NODE_APLAY_DEBUG)
        {
            this.process.stdout.pipe(process.stdout);
            this.process.stderr.pipe(process.stderr);
        }

        return this;
    }

    /**
     * Stop playing audio, if any.
     */
    stop()
    {
        if (!this.process)
        {
            return;
        }

        this.process.removeAllListeners();
        this.process.kill('SIGKILL');
        this.process = null;
        this.emit('stop');
    }

    /**
     * Pause the current playing file, if there is one.
     */
    pause()
    {
        if (!this.process || this.paused)
        {
            return;
        }

        this.process.kill('SIGSTOP');
        this.paused = true;
        this.emit('pause');
    }

    /**
     * Resume audio if it previously got paused.
     */
    resume()
    {
        if (!this.process || !this.paused)
        {
            return;
        }

        this.process.kill('SIGCONT');
        this.paused = false;
        this.emit('resume');
    }

    /**
     * Set aplay channels.
     *
     * Note that it will only take effect on next `play()` calls.
     *
     * @param {?Number} channels Number of channels [1;32]. Pass `null`
     *  to default to aplay defaults.
     */
    channels(channels)
    {
        this._channels = channels;

        if (this._channels !== null && (typeof this._channels !== 'number' ||
           this._channels < 1 || this._channels > 32))
        {
            throw new Error('channels must be either null either a number in range [1;32].');
        }
    }
}

module.exports = Aplay;

if (!module.parent)
{
    const filename = process.argv[2];
    if (!filename)
    {
        console.error('usage: node node-aplay.js <filename>');
        console.error('node-aplay is a node module to play WAV files through aplay as a spawned process.');
        process.exit(1);
    }

    const player = new Aplay();
    player.play(filename);
}
