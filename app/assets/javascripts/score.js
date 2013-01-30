
$(document).ready(function(){ 
	$('#randomise').click(function(){
		rifff.writeScore();
	});
});

rifff.writeScore = function() { 
	
	var options_in_bank; 
	var option_choice = []; 
	var certain_play; 
	//declare the score array
	rifff.score = [];
	for (i = 0; i<rifff.data.project_info.steps; i++) { 
		rifff.score[i] = [];
	}
	
	//loop through an make the choices 
	$.each(rifff.score, function(step_key, step_val) { 
		$.each(rifff.data.banks, function(bank_key, value){ 
			
			option_choice = []; //reset array
			certain_play = false; 
			
			//move values into fresh array
			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val) { 
				probability = bank_option_val.sequence[step_key];
				//test if there is something that's definately going to play
				if (probability == 3) { 
					certain_play = true;
				}
				option_choice.push(probability);
			});
			
			
			//if there are things that are certain to play, eliminate everything else
			if (certain_play) {
				$.each(option_choice, function(key, val) { 
					if (val != 3) { 
						option_choice[key] = 0;
					}
				});
			}
			
			//now randomise values 
			$.each(option_choice, function(key, val) { 
					option_choice[key] = (val * Math.random() * 3) + val ;
			});
						
			
			//find highest value 			
			bank_option_choice = option_choice.max();
			
			if (option_choice[bank_option_choice] > 3){
				rifff.score[step_key][bank_key] = bank_option_choice ;
			}
			else { 
				rifff.score[step_key][bank_key] = '-';
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

			if (rifff.score[step_key][bank_key] != '-') { 
				selector = '.step[data-step-no='+step_key+'][data-bank='+bank_key+'][data-bank-option='+rifff.score[step_key][bank_key]+']';
				
				
				$(selector).css('background-image','url(/assets/selected.png)');          
			} 

		});
	});
}



Array.prototype.max = function() {
  return this.indexOf(Math.max.apply(null, this))
}