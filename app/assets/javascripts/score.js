
/* 

How the scoring and playback works
----------------------------------

Firstly, scoring occurs in two pases. The write score function finds out which steps should play when 
ignoring loop and overplay.

Secondly fillInOverPlay function goes through and extends any samples that need to be extended, including marking for
each one the duration and offset for each sample. This is necessary because if the user begins playback in a section
which should play because of overplay it needs to trigger the sample, however it should not trigger then sample if the
user is the middle of playback - that sample will already have been triggered earlier. 

Finally, the schedule function creates audioBufferSource objects to actually play back each occasion a sample occurs. 

*/

rifff.writeScore = function() { 

	var option_choice = []; 
	
	//erase existing score 	
	for (i = 0; i<rifff.data.project_info.steps; i++) {
	    rifff.score[i] = [];
	    for (j=0; j<rifff.data.banks.length; j++) {
		    rifff.score[i][j] = [];
	    }
	}
	
	//loop through an make the choices 
	$.each(rifff.score, function(step_key, step_val) { 
        
		$.each(rifff.data.banks, function(bank_key, value){ 
						
			option_choice = []; //reset array
			
			//move values into fresh array & note if this step is certain to play
			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val) { 
				option_choice.push(bank_option_val.sequence[step_key]);
			});
			
			//now randomise values 
			$.each(option_choice, function(key, val) {
				if (val === 3) {//black squares are always going to play, add 5 to lift them out of the other noise
					option_choice[key] = 20 + (Math.random());
				}
				
				if (val === 1) {
					option_choice[key] = ( 0.25 + Math.random() );
				}

				if (val === 2) {
					option_choice[key] = ( 0.5 + Math.random() );
				}

			});
			
			var bank_option_choice = option_choice.max();

			//find highest value 			
			if (option_choice[bank_option_choice] > 1){
				rifff.score[step_key][bank_key]['bank_option'] 		= bank_option_choice;
				rifff.score[step_key][bank_key]['time'] 			= 0;
				rifff.score[step_key][bank_key]['overplay_step']	= false;
				rifff.score[step_key][bank_key].duration 			= rifff.loop_trigger_interval;
			}
		});
	});

	rifff.fillInOverPlay(); 
}

rifff.fillInOverPlay = function() { 
	$.each(rifff.score, function(step_key, step_val) { 
		$.each(rifff.score[step_key], function(bank_key, bank_value){ 
			//If a step is playing, is not the result of another overplay, and overplay is enable on this bank
			if(typeof bank_value.bank_option !== 'undefined' && !bank_value.overplay_step ){
				
				var overplay = rifff.data.banks[bank_key].bank_options[bank_value.bank_option].overplay;
				var loop = rifff.data.banks[bank_key].bank_options[bank_value.bank_option].loop;

				if(overplay) {

					var number_of_forward_steps = parseInt(rifff.data.project_info.steps) - step_key;

					//find out how long this is going to play for if voice stolen 
					for (var overplay_length = 1; overplay_length<number_of_forward_steps; overplay_length++) {	
				
						if(typeof rifff.score[step_key+overplay_length][bank_key].bank_option === "undefined") {
	         
						} else { 							
							break;
						} 
					}

					//find out how long this will play for if voice not stolen 
					var audio_steps_duration = rifff.getAudioDurationInSteps(bank_key, bank_value.bank_option); 
					
					//choose the shortest 
					if(audio_steps_duration < overplay_length) { 
						var final_overplay_length = audio_steps_duration;
					} else  {
						var final_overplay_length = overplay_length;
					}
			
					//now set the duration of the first step
					rifff.score[step_key][bank_key].duration = (final_overplay_length)* rifff.loop_trigger_interval


					//for each of the steps fill out the data
					for (var test_step = 1; test_step<final_overplay_length; test_step++) {	 			
				    	if(typeof rifff.score[step_key+test_step][bank_key].bank_option === "undefined"){
				        	rifff.score[step_key+test_step][bank_key].bank_option = bank_value.bank_option;
	                    	rifff.score[step_key+test_step][bank_key].time = test_step * rifff.loop_trigger_interval;
	                    	rifff.score[step_key+test_step][bank_key].duration = (final_overplay_length - test_step)* rifff.loop_trigger_interval;
	                    	rifff.score[step_key+test_step][bank_key].overplay_step = true;
		                	
		                } else {
	                		break;	         
	                	}
	                }

	            }
			}
		});
	});


	rifff.renderScore();
}

    

rifff.renderScore = function() { 

	var selector;

	$('.step').css('background-image','none'); 
	
	$.each(rifff.score, function(step_key, step_val) { 
		$.each(rifff.data.banks, function(bank_key, value){		 
			if (rifff.score[step_key][bank_key]['bank_option'] != '-') { 
				selector = '#step_'+bank_key+'_'+rifff.score[step_key][bank_key]['bank_option']+'_'+step_key;
				$(selector).css('background-image','url(/assets/selected.png)');          
			} 

		});
	});
};



Array.prototype.max = function() {
	return this.indexOf(Math.max.apply(null, this))
}

rifff.getAudioDurationInSteps = function(bank_key,bank_option_choice) {
    var id = $(".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_choice+"']").val()
    var temp_sound = context.createBufferSource();
    if (typeof rifff.audioBuffers[id] == 'object') {
        temp_sound.buffer = rifff.audioBuffers[id];
        var sound_duration  = temp_sound.buffer.duration;
        var length_of_step = (60/rifff.bpm) * rifff.bpl;
	    number_of_forward_steps = Math.parseInt((sound_duration/length_of_step)-1);
        return number_of_forward_steps;
    }
    else { 
    	return false
    }
}