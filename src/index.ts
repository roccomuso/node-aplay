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

import { ChildProcessWithoutNullStreams, exec, spawn } from 'child_process';
import EventEmitter from 'events';
interface SoundOptions {
  volume?: number;
  channelMap?: ChannelMap[];
}

type ChannelMap =
  | 'left'
  | 'right'
  | 'front-left'
  | 'front-right'
  | 'mono'
  | 'front-center'
  | 'rear-left'
  | 'rear-right'
  | 'rear-center'
  | 'lfe'
  | 'front-left-of-center'
  | 'front-right-of-center'
  | 'side-left'
  | 'side-right'
  | 'top-center'
  | 'top-front-center'
  | 'top-front-left'
  | 'top-front-right'
  | 'top-rear-left'
  | 'top-rear-right'
  | 'top-rear-center';

const relative_to_absolute_volume = (relative_volume: number) => {
  const volume = Math.max(0, Math.min(100, relative_volume));
  return Math.floor((65536 / 100) * volume);
};

export class Sound extends EventEmitter {
  private _sink_input_id?: string;
  private _volume = 45000;
  private _process?: ChildProcessWithoutNullStreams;
  private _stopped = true;
  private _channelMap: ChannelMap[] = ['left', 'right'];

  constructor(options: SoundOptions = {}) {
    super();

    if (options.volume) {
      this._volume = relative_to_absolute_volume(options.volume);
    }

    if (options.channelMap) {
      this._channelMap = options.channelMap;
    }
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

    let args: string[] = [
      `--volume=${this._volume}`,
      `--channels=${this._channelMap.length}`,
      `--channel-map=${this._channelMap}`,
    ];

    if (fileName) args = args.concat([fileName]);
    this._process = spawn('pacat', args);

    this._process.on('spawn', () => {
      exec('pacmd list-sink-inputs', {}, (error, stdout) => {
        stdout.split('index: ').forEach((sinkInput) => {
          if (fileName && sinkInput.includes(fileName)) {
            this._sink_input_id = sinkInput.split(/\r?\n/)[0];
          }
        });
      });
    });

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

  public setVolume(volume: number): this {
    this._volume = relative_to_absolute_volume(volume);
    exec(`pacmd set-sink-input-volume ${this._sink_input_id} ${this._volume}`);

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

      // exec(`pactl suspend-source ${this._sink_input_id} 1`);
      this.emit('pause');
    }

    return this;
  }

  public resume(): this {
    if (this._process) {
      if (this._stopped) return this.play();

      // exec(`pactl suspend-source ${this._sink_input_id} 0`);
      this._process.kill('SIGCONT');
      this.emit('resume');
    }
    return this;
  }
}
