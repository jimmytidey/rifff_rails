


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
			}
		});
	});

	rifff.fillInOverPlay(); 
}

rifff.fillInOverPlay = function() { 
	$.each(rifff.score, function(step_key, step_val) { 
		$.each(rifff.score[step_key], function(bank_key, bank_value){ 
			
			var overplay = rifff.data.banks[bank_key].bank_options[bank_value.bank_option].overplay;

			//If a step is playing, is not the result of another overplay, and overplay is enable on this bank
			if(typeof bank_value.bank_option !== 'undefined' && !bank_value.overplay_step && overplay){
				
				var number_of_forward_steps = rifff.getAudioDurationInSteps(bank_key,bank_value.bank_option);
				if(step_key+number_of_forward_steps < parseInt(rifff.data.project_info.steps)){
					number_of_forward_steps = parseInt(rifff.data.project_info.steps) - step_key;
				}

				for (var test_step = 0; test_step<number_of_forward_steps; test_step++) {
			    				   			
			    	if(typeof rifff.score[step_key+test_step][bank_key].bank_option === "undefined"){
			        	rifff.score[step_key+test_step][bank_key]['bank_option'] = bank_value.bank_option;
                    	rifff.score[step_key+test_step][bank_key]['time'] = test_step * (60/rifff.bpm) * rifff.bpl;
                    	rifff.score[step_key+test_step][bank_key]['overplay_step'] = true;
                	} else { 
                		//console.log('gap');
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
        //console.log('length of step', length_of_step);
	    number_of_forward_steps = Math.floor((sound_duration/length_of_step)-1);
        return number_of_forward_steps;
    }
    else { 
    	return false
    }
}