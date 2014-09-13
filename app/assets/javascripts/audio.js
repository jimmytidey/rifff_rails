window//HANDLES AUDIO PLAYBACK 

console.log("AUDIO");

rifff = {};
rifff.previewAudioNodes= [];
rifff.playstate = '';
rifff.audioBuffers = [];

var context;

if (webkitAudioContext && !window.AudioContext) { 
    i_am_very_old = true;
} else {
    i_am_very_old = false;
}


function initContext() {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
}
catch(e) {
    alert('Web Audio API is not supported in this browser');
}
}

initContext();


rifff.current_step=0;

rifff.lookahead = -1;

rifff.files_loaded = 0;

rifff.build_sound_matrix_test = true;
var worker = new Worker('/assets/worker.js');




rifff.play = function(){ 
    if (rifff.play_status !== 'playing') {
        rifff.loop_trigger_interval =  (rifff.bpl / (rifff.bpm / 60));
        rifff.shedule();
        rifff.step_timer = setInterval("rifff.stepUpdater()", rifff.loop_trigger_interval*1000);
    }    
    rifff.play_status = 'playing'
}


rifff.stepUpdater = function() {
    rifff.current_step++;   
    rifff.updatePlayhead();
    console.log("MOVED TO STEP:" + rifff.current_step + " at time " + context.currentTime);
}


rifff.shedule = function() {
    var steps_into_future = 0;
    var bank_option_to_play;
    var time_to_play;
    var sample_offset;
    
    rifff.timeOffset = context.currentTime; 
    
    for(step_key=rifff.current_step; step_key< rifff.score.length; step_key++) {

        time_to_play = (steps_into_future * rifff.loop_trigger_interval) + rifff.timeOffset; 
        
        for(bank_key=0; bank_key<rifff.data.banks.length; bank_key++) {

            if(typeof rifff.score[step_key][bank_key]['bank_option'] !== 'undefined' && (rifff.score[step_key][bank_key]['time']===0 || steps_into_future===0 )){

                bank_option_to_play = rifff.score[step_key][bank_key]['bank_option'];
                sample_offset       = rifff.score[step_key][bank_key]['time'];
                rifff.playSound(bank_key, bank_option_to_play, step_key, time_to_play, sample_offset);
            }    
        }
        steps_into_future++;
    }
}



rifff.playSound = function(bank_key, bank_option, step, time, offset) {
    //console.log('recieving', bank_key, bank_option, step_key, time, offset);
    //stop all other playback on this step 
    for (bank_option_erase=0; bank_option_erase<rifff.data.banks[bank_key].bank_options.length; bank_option_erase++) {                
        if(typeof rifff.sounds[bank_key][bank_option_erase][step] === "object") {
            if(i_am_very_old) {
                rifff.sounds[bank_key][bank_option_erase][step].noteOff(0);
            } else { 
                rifff.sounds[bank_key][bank_option_erase][step].stop(0);
            }
        } 
    }
    

    //make source node
    var selector =".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"']"; 
    var id = $(selector).val();
    
    if(typeof rifff.audioBuffers[id] === 'object') {

        rifff.sounds[bank_key][bank_option][step] = context.createBufferSource();
        rifff.sounds[bank_key][bank_option][step].buffer = rifff.audioBuffers[id];
        
        if(i_am_very_old) {
            rifff.gains[bank_key][bank_option][step] = context.createGainNode();
        } else {
            rifff.gains[bank_key][bank_option][step] = context.createGain();
        }


        //calculate MP3 delay
        var sample_rate = rifff.sounds[bank_key][bank_option][step].buffer.sampleRate;
        var duration = rifff.sounds[bank_key][bank_option][step].buffer.duration;
        var delay_amount = (1/sample_rate) *512;
        offset = parseFloat(offset + delay_amount);

    	//set the gain of this node 
        rifff.sounds[bank_key][bank_option][step].connect(rifff.gains[bank_key][bank_option][step]);
        rifff.gains[bank_key][bank_option][step].gain.value = parseFloat(rifff.data.banks[bank_key].bank_options[bank_option].volume /100);

        rifff.gains[bank_key][bank_option][step].connect(context.destination);

        //set the duration TODO : what was this conditional for? 
        var duration;
    //    if(rifff.loop_trigger_interval- offset < rifff.sounds[bank_key][bank_option][step]['buffer']['duration']) {
        duration = rifff.loop_trigger_interval - offset; 
    //        console.log('if');
    //    }
    //    else { 
    //        duration = rifff.sounds[bank_key][bank_option][step] - offset;

     //   }

        //if overplay is on 
        if(rifff.data.banks[bank_key].bank_options[bank_option].overplay) {
            duration = parseFloat(rifff.sounds[bank_key][bank_option][step]['buffer']['duration'] - offset);

            //check forward to see if voice steeling should happen 


        }

        //add looping to this sample, if it's turned on
        if(rifff.data.banks[bank_key].bank_options[bank_option].loop) {
           rifff.sounds[bank_key][bank_option][step].loop = true;
           rifff.sounds[bank_key][bank_option][step].loopStart= delay_amount;
           rifff.sounds[bank_key][bank_option][step].loopEnd= rifff.sounds[bank_key][bank_option][step]['buffer']['duration']-(delay_amount *2);
           offset=0;

           if(i_am_very_old) {
               rifff.sounds[bank_key][bank_option][step].noteOn(time);
               rifff.sounds[bank_key][bank_option][step].noteOff(parseFloat(rifff.loop_trigger_interval + time));
           } 
           else { 
               rifff.sounds[bank_key][bank_option][step].start(time);
               rifff.sounds[bank_key][bank_option][step].stop(parseFloat(rifff.loop_trigger_interval + time));
           }
       }
       else {
           if(i_am_very_old) {
               rifff.sounds[bank_key][bank_option][step].noteGrainOn(time, offset, duration);
           } 
           else {
            rifff.sounds[bank_key][bank_option][step].start(time, offset, duration);
        }
    }
}    
}

rifff.stop = function(){ 
    clearInterval(rifff.step_timer);
    for(bank=0; bank<rifff.data.banks.length; bank++) {

        for (bank_option=0; bank_option<rifff.data.banks[bank].bank_options.length; bank_option++) {
            if(typeof rifff.sounds[bank][bank_option] !== 'undefined') {
                for (step = 0; step < parseInt(rifff.data.project_info.steps); step++) {

                    if(typeof rifff.sounds[bank][bank_option][step] === "object") {
                        if(i_am_very_old) { 
                            rifff.sounds[bank][bank_option][step].noteOff(0);
                        }
                        else {
                            rifff.sounds[bank][bank_option][step].stop(0);
                        }
                    } 
                }
            }    
            rifff.sounds[bank][bank_option] = [];
            rifff.gains[bank][bank_option] = [];
        }
    }
    rifff.play_status = 'stopped';
}



rifff.playSoundById= function(id){
    rifff.previewAudioNodes[id] = context.createBufferSource();
    rifff.previewAudioNodes[id].buffer = rifff.audioBuffers[id];
    rifff.previewAudioNodes[id].connect(context.destination); 
    rifff.previewAudioNodes[id].start(0);
}

rifff.stopSoundById= function(id){
    rifff.previewAudioNodes[id].stop();
}