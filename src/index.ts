/**
 * Javascript ALSA aplay and amixer wrapper for Node.js
 *
 * @mantainedBy Jesse Kirschner - @JesseKirschner
 * @author Rocco Musolino - @roccomuso
 * @author Patrik Melander (lotAballs) node-aplay module
 * @originalAuthor Maciej Sopyło - @KILLAHFORGE
 *
 * Dependencies: sudo apt-get install alsa-base alsa-utils
 * MIT License
 */

import * as os from 'os';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import EventEmitter from 'events';

const aplayExec = os.platform() === 'darwin' ? 'afplay' : 'aplay';

interface SoundOptions {
  channel?: number;
}

export class Sound extends EventEmitter {
  private _channel?: number;
  private _process?: ChildProcessWithoutNullStreams;
  private _stopped = true;

  constructor(options: SoundOptions = {}) {
    super();

    this._channel = options.channel;
  }

  /**
   * Play file once, for x amount of loops or loop indefinitly
   *
   * @param {string} fileName - absolute path of file
   * @param {number} loops - amount of loops, or -1 for endless loops
   * @returns self
   */
  public play(fileName?: string, loops = 0): this {
    this._stopped = false;

    if (this._process) this._process.kill('SIGTERM');

    let args: string[] = this._channel ? [`-c ${this._channel}`] : [];
    if (fileName) args = args.concat([fileName]);

    this._process = spawn(aplayExec, args);
    this._process.on('exit', (code, sig) => {
      if (loops != 0) {
        this.play(fileName, loops - 1);
      } else {
        this._stopped = true;
        if (code !== null && sig === null) this.emit('complete');
      }
    });

    return this;
  }

  public stop(): this {
    if (this._process) {
      this._stopped = true;
      this._process.kill('SIGTERM');
      this.emit('stop');
    }

    return this;
  }

  public pause(): this {
    if (this._process) {
      if (this._stopped) return this;
      this._process.kill('SIGSTOP');
      this.emit('pause');
    }

    return this;
  }

  public resume(): this {
    if (this._process) {
      if (this._stopped) return this.play();

      this._process.kill('SIGCONT');
      this.emit('resume');
    }
    return this;
  }

  public setChannel(ch: number): this {
    this._channel = ch;
    return this;
  }
}

export const __useDefault = true;

// autonomous execution: node node-aplay.js my-song.wav
if (require.main === module) {
  const player = new Sound();
  player.play(process.argv[2]);
}
