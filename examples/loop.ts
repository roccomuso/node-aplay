import { Sound } from '../src/index';

const sound_A = new Sound({ volume: 80, channelMap: ['left'] });

// loop 3 times
sound_A.play(`${__dirname}/audio/01_mond_bubble.wav`, 3);

// loop
sound_A.play(`${__dirname}/audio/01_mond_bubble.wav`, -1);
