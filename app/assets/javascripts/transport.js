
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
                    try { 
                        rifff.stopNode(rifff.sounds[bank][bank_option][step]);
                    } catch(err) { 
                        console.log('hi');
                    }
                }
            }    
            rifff.sounds[bank][bank_option] = [];
            rifff.gains[bank][bank_option] = [];
        }
    }
    rifff.play_status = 'stopped';
}


rifff.playNode =function(node, when, offset, duration) { 
    if(i_am_very_old) {
        node.noteOn(when, offset, duration);
        node.noteOff(when+duration);
    } 
    else {
        node.start(when, offset, duration);
        node.stop(when+duration);
    }
}

rifff.stopNode =function(node) { 
    if(typeof node === "object") {
        if(i_am_very_old) { 
            node.noteOff(0);
        }
        else {
            
            node.stop(0);
        }
    } 
}

rifff.stepUpdater = function() {
    if (rifff.current_step < rifff.data.project_info.steps-1) {
        rifff.firstStepOfPlayback = false; 
        rifff.current_step++;   
        rifff.updatePlayhead();
    } else { 
        rifff.stop();
    }
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


rifff.forward = function() { 

    if (rifff.current_step < rifff.data.project_info.steps-1) {
        rifff.current_step ++;
        rifff.updatePlayhead();
        rifff.stop();
    }
}

rifff.backward = function() { 

    if (rifff.current_step < rifff.data.project_info.steps-1) {
        rifff.current_step ++;
        rifff.updatePlayhead();
        rifff.stop();
    }
}