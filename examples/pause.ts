import { Sound } from '../src/index';

const sound_A = new Sound({ volume: 50 });

// loop
sound_A.play(`${__dirname}/audio/01_background_bubble.wav`, -1);

setTimeout(() => {
  //will pause after 4 seconds
  sound_A.pause();

  console.log('pause');
  //will resume after 4 seconds
  setTimeout(() => sound_A.resume(), 4000);
}, 4000);
