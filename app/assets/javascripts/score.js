
console.log("SCORE PAGE");

$(document).ready(function(){ 
	$('#randomise').click(function(){
		rifff.writeScore();
	});
});


rifff.writeScore = function() { 
    console.log('writing score');
	var options_in_bank; 
	var option_choice = []; 
	var certain_play; 
	var overplay;
	var sound_duration;
	var time_offset;
	var overplay_selector;
	
	//declare the score array
	rifff.score = [];
	for (i = 0; i<rifff.data.project_info.steps; i++) {
	    rifff.score[i] = [];
	    for (j=0; j<rifff.data.banks.length; j++) {
		    rifff.score[i][j] = [];
	    }
	}
	
	//loop through an make the choices 
	$.each(rifff.score, function(step_key, step_val) { 
	    console.log('step---' + step_key);
		$.each(rifff.data.banks, function(bank_key, value){ 
			
			option_choice = []; //reset array
			certain_play = false; 
			
			//move values into fresh array & note if this step is certain to play
			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val) { 
				option_choice.push(bank_option_val.sequence[step_key]);
			});
			
			//now randomise values 
			$.each(option_choice, function(key, val) { 
					option_choice[key] = (val * Math.random() * 3) + val ;
			});
			
			//find highest value 			
			bank_option_choice = option_choice.max();
			
			//if there is a high above 3, this must be the sound to play in this bank
			if (option_choice[bank_option_choice] > 3){
			    console.log('setting bank ' + bank_key + "to " + bank_option_choice);
				rifff.score[step_key][bank_key]['bank_option'] = bank_option_choice;
				rifff.score[step_key][bank_key]['time'] = 0;
			}
			
			//else, need to checkbackwards to see if there is an overplay
			else {
			    console.log('testing for overplay');
                for (test_step = step_key-1; test_step>=0; test_step--) {
                    if (rifff.score[test_step][bank_key]['bank_option'] != '-') { 
                        overplay_selector = ".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+rifff.score[test_step][bank_key]['bank_option']+"'] .overplay";
                        overplay = $(overplay_selector).is(':checked');	  
                       
                        if (overplay && rifff.score[test_step][bank_key]['time'] ==0) {
                            sound_duration = parseInt(soundManager.getSoundById("sound_"+bank_key + '_'+rifff.score[test_step][bank_key]['bank_option']).duration);
                            time_offset    = (60/rifff.bpm) * rifff.bpl * (step_key-test_step)*1000;
                            console.log('overplay detected, sound duration ' + sound_duration + " time in for this step " + time_offset);
                             console.log('Test step ' + test_step + "step_key" + step_key);
                            if (time_offset < sound_duration-100) {
                                rifff.score[step_key][bank_key]['bank_option'] = rifff.score[test_step][bank_key]['bank_option'];
                                rifff.score[step_key][bank_key]['time'] = time_offset;
                            }
                        }
                        else { 
                            //rifff.score[step_key][bank_key]['bank_option'] = '-';
                            //this step has no value
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
	
	$.each(rifff.score, function(step_key, step_val) { 
		$.each(rifff.data.banks, function(bank_key, value){
			
			selector = '.step[data-step-no='+step_key+'][data-bank='+bank_key+']';
			$(selector).css('background-image','none'); 

			if (rifff.score[step_key][bank_key]['bank_option'] != '-') { 
				selector = '.step[data-step-no='+step_key+'][data-bank='+bank_key+'][data-bank-option='+rifff.score[step_key][bank_key]['bank_option']+']';
				$(selector).css('background-image','url(/assets/selected.png)');          
			} 

		});
	});
}



Array.prototype.max = function() {
  return this.indexOf(Math.max.apply(null, this))
}