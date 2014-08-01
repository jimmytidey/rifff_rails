
console.log("SCORE PAGE revised");

$(document).ready(function(){ 
	$('#randomise').click(function(){
		rifff.writeScore();
	});
});


rifff.writeScore = function() { 
    console.log('writing score');
	var options_in_bank; 
	var option_choice = []; 
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
        
		$.each(rifff.data.banks, function(bank_key, value){ 
						
			option_choice = []; //reset array
			
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
			    //console.log('setting bank ' + bank_key + "to " + bank_option_choice);
				rifff.score[step_key][bank_key]['bank_option'] = bank_option_choice;
				rifff.score[step_key][bank_key]['time'] = 0;
				
				//loop through every step in the furture set it zero for this bank
				//needed to prevent two voices playing at the same time because a prior one had an overplay
				var number_of_forward_steps = rifff.data.project_info.steps - step_key;
				var test_step;
				for (test_step = 1; test_step<number_of_forward_steps; test_step++) {    				    
				    rifff.score[step_key+test_step][bank_key] = [];
				}
				
				//programme forward looking overplay
				if(rifff.data.banks[bank_key].bank_options[bank_option_choice].overplay) {
				    var id = $(".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_choice+"']").val()
				    var temp_sound = context.createBufferSource();
				    if (typeof rifff.audioBuffers[id] == 'object') {
                        temp_sound.buffer = rifff.audioBuffers[id];
                    
                    
                        var sound_duration  = temp_sound.buffer.duration ;
                        var length_of_step = (60/rifff.bpm) * rifff.bpl;
                        console.log('length of step', length_of_step);
    				    number_of_forward_steps = (sound_duration/length_of_step)-1;

        				for (test_step = 0; test_step<number_of_forward_steps; test_step++) {
    				    
        				    if(step_key+test_step < parseInt(rifff.data.project_info.steps)){
    	
        				        var time_offset = test_step * length_of_step;
        				        rifff.score[step_key+test_step][bank_key]['bank_option'] = bank_option_choice;
                                rifff.score[step_key+test_step][bank_key]['time'] = time_offset;
                            }
        				}
        			}	
    			}	
				
			}
			
            //detect end of loop
			if(step_key == parseInt(rifff.data.project_info.steps)-1 && (rifff.data.banks.length-1) == bank_key) { 
    	        rifff.renderScore();
    	    }
			
		});

	});

    
};

rifff.renderScore = function() { 
	console.log('Render Score');
	
	
	var selector;
	$('.step').css('background-image','none'); 
	
	$.each(rifff.score, function(step_key, step_val) { 
		$.each(rifff.data.banks, function(bank_key, value){
			
		 
			if (rifff.score[step_key][bank_key]['bank_option'] != '-') { 
			    
			    //selector = '.step[data-step-no='+step_key+'][data-bank='+bank_key+'][data-bank-option='+rifff.score[step_key][bank_key]['bank_option']+']';
				selector = '#step_'+bank_key+'_'+rifff.score[step_key][bank_key]['bank_option']+'_'+step_key;
				$(selector).css('background-image','url(/assets/selected.png)');          
			} 

		});
	});
};



Array.prototype.max = function() {
  return this.indexOf(Math.max.apply(null, this))
}