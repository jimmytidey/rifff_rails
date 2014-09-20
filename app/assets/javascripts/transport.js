
rifff.current_step = 0;
rifff.firstStepOfPlayback = true; 

rifff.play = function(){ 
    if (rifff.play_status !== 'playing') {
        rifff.loop_trigger_interval =  (rifff.bpl / (rifff.bpm / 60));
        rifff.schedule();
        rifff.step_timer = setInterval("rifff.stepUpdater()", rifff.loop_trigger_interval*1000);
    }    
    rifff.firstStepOfPlayback = true; 
    rifff.play_status = 'playing';
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

rifff.stepUpdater = function() {
    rifff.firstStepOfPlayback = false; 
    rifff.current_step++;   
    rifff.updatePlayhead();
}


rifff.updatePlayhead = function() { 
	
	var playhead_offset; 
	
	if (rifff.mode == 'edit') { 
		playhead_offset = 293;
	}
	
	else { 
		playhead_offset = 5; 
	}
	var left =  (rifff.current_step * 17) + playhead_offset;
	$('#playhead').css('left', left);
}