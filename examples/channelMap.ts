import { Sound } from '../src/index';

// will play a sound left and the other right
const sound_A = new Sound({ channelMap: ['left'] });
const sound_B = new Sound({ channelMap: ['right'] });

sound_A.play(`${__dirname}/audio/01_mond_bubble.wav`, -1);
sound_B.play(`${__dirname}/audio/01_background_bubble.wav`, -1);
