import { Sound } from '../src/index';

// will play a sound with a volume of 40 on a scale of 100
const sound_A = new Sound({ volume: 40 });

sound_A.play(`${__dirname}/audio/01_mond_bubble.wav`, -1);

setTimeout(() => {
  //will increase the volume by 30 after 4 seconds
  sound_A.setVolume(70);
}, 4000);
