//set up objects
rifff = {};


//This is the 2D array of what should play on each bank of each step, decided by running the randomisation process
rifff.score = [];

//Store for the audio data so that it can be assigned where ever it's needed. 1D array of audio buffers
rifff.audioBuffers = [];

rifff.current_step = 0;
rifff.files_loaded = 0;


//use a web worker to get accurate step timings
var worker = new Worker('/assets/worker.js');


//shim webkit audio
try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
} catch(e) {
    alert('Web Audio API is not supported in this browser');
}














