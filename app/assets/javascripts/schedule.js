

//This function loops through the score array and creates an array of sounds and when they are scheduled to play 
rifff.schedule = function() {
    var steps_into_future = 0;
    var bank_option_to_play;
    var time_to_play;
    var sample_offset;
    
    rifff.timeOffset = context.currentTime; 
    
    for(step_key=rifff.current_step; step_key< rifff.score.length; step_key++) {

        time_to_play = (steps_into_future * rifff.loop_trigger_interval) + rifff.timeOffset; 
        
        for(bank_key=0; bank_key<rifff.data.banks.length; bank_key++) {

            if(typeof rifff.score[step_key][bank_key]['bank_option'] !== 'undefined'){

                var bank_option_to_play = rifff.score[step_key][bank_key]['bank_option'];
                var sample_offset       = rifff.score[step_key][bank_key]['time'];
                var duration            = rifff.score[step_key][bank_key]['duration'];
                
                rifff.scheduleStep(bank_key, bank_option_to_play, step_key, time_to_play, duration, sample_offset);
            }    
        }
        steps_into_future++;
    }
}


//When the schedule discovers a step that needs to be played, this function writes it into the rifff.sounds array
rifff.scheduleStep = function(bank_key, bank_option, step, when, duration, offset) {

    rifff.eraseExistingScheduleForStep(bank_key);
    
    var selector =".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"']"; 
    var id = $(selector).val();
    
    if(typeof rifff.audioBuffers[id] === 'object') { //check to make sure this sound exists 

        rifff.addToSounds(bank_key, bank_option, step);

        //add looping to this sample, if it's turned on
        if(rifff.data.banks[bank_key].bank_options[bank_option].loop) {
            rifff.sounds[bank_key][bank_option][step].loop = true;
        }
        
        //only play this sample if it is not an overplay step, or if it the first step of playback and we are in overplay
        if(!rifff.score[step][bank_key].overplay_step || step == rifff.current_step) {
            console.log(duration);
            rifff.playNode(rifff.sounds[bank_key][bank_option][step], when, offset, duration);
        }

        rifff.sounds[bank_key][bank_option][step].info                  = {};
        rifff.sounds[bank_key][bank_option][step].info.start_time       = when - rifff.timeOffset;
        rifff.sounds[bank_key][bank_option][step].info.sample_offset    = offset;
        rifff.sounds[bank_key][bank_option][step].info.duration         = duration; 
        
    }    
}



rifff.eraseExistingScheduleForStep = function (bank_key, step) {

  for (bank_option_erase=0; bank_option_erase<rifff.data.banks[bank_key].bank_options.length; bank_option_erase++) {                
      if(typeof rifff.sounds[bank_key][bank_option_erase][step] === "object") {
          if(i_am_very_old) {
              rifff.sounds[bank_key][bank_option_erase][step].noteOff(0);
          } else { 
              rifff.sounds[bank_key][bank_option_erase][step].stop(0);
          }
      } 
  }
}

rifff.addToSounds = function(bank_key, bank_option, step){ 

    var selector =".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"']"; 
    var id = $(selector).val();

    rifff.sounds[bank_key][bank_option][step] = context.createBufferSource();
    rifff.sounds[bank_key][bank_option][step].buffer = rifff.audioBuffers[id];
    
    /*
    rifff.sounds[bank_key][bank_option][step].onended = function() {
        $('div[data-bank="'+bank_key+'"][data-bank-option="'+bank_option+'"] .play_indicator').css('background-color', 'white');
    };
    */

    if(i_am_very_old) {
        rifff.gains[bank_key][bank_option][step] = context.createGainNode();
    } else {
        rifff.gains[bank_key][bank_option][step] = context.createGain();
    }

  rifff.sounds[bank_key][bank_option][step].connect(rifff.gains[bank_key][bank_option][step]);

    //set the gain of this node 
    rifff.gains[bank_key][bank_option][step].gain.value = parseFloat(rifff.data.banks[bank_key].bank_options[bank_option].volume /100);
    rifff.gains[bank_key][bank_option][step].connect(context.destination);
}

rifff.calculateMP3Delay = function(buffer){
    var sample_rate = buffer.sampleRate;
    var delay = (1/sample_rate) *512;
    return(delay);
}