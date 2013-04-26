
rifff.attachClickEvents = function() {
  
  //attach click events 
  	$('#play').unbind('click');
	$('#play').click(function(){
	  console.log('playing');
		rifff.play();
	});
    
    $('#stop').unbind('click');
	$('#stop').click(function(){
		rifff.stop();
	});
	
	$('#forward').unbind('click');
	$('#forward').click(function(){
		if (rifff.current_step < rifff.data.project_info.steps-1) {
			rifff.current_step ++;
			rifff.updatePlayhead();
			rifff.stop();
		}
	});
    
    $('#backwards').unbind('click');
	$('#backwards').click(function(){
		if (rifff.current_step > 0) {
			rifff.current_step--;
			rifff.updatePlayhead();	
			rifff.stop();
		}		
	});
	
	$('#rewind').unbind('click');
	$('#rewind').click(function(){
		rifff.current_step = 0;
		rifff.updatePlayhead();	
		rifff.stop();	
	});
		 
	$('.step').click(function(){

		var value = parseInt($(this).attr('data-value'));
		var bank = $(this).attr('data-bank');
		var bank_option = $(this).attr('data-bank-option');
		var step = $(this).attr('data-step-no');
		

		value = value+1;
		
		if (value == 1) { 
			$(this).css('background-color', '#ccc');
		}  
		if (value == 2) { 
			$(this).css('background-color', '#999');
		}
		if (value == 3) { 
			$(this).css('background-color', '#222');
		}
		if (value > 3) { 
			value = 0;
			$(this).css('background-color', '#fff');
		}		
		
		$(this).attr('data-value', value);
		
		rifff.data.banks[bank].bank_options[bank_option].sequence[step] = value;
		rifff.saveJson();
		
	});
	
	//rename bank 
	function retitle_bank() { 
  	$('.bank_title').click(function(){ 
  	  var title = $(this).text();
	  
  	  $(this).replaceWith("<div class='bank_title'><input class='title_rename' type='text' value='"+ title + "' /></div>");
	  
  	  $('.title_rename').blur(function() { 
        var bank_id   = $(this).parents('.bank_container').attr('data-bank');
        var new_title = $(this).val();
        rifff.data.banks[bank_id]['bank_name'] = new_title;
        rifff.saveJson();
        $(this).parent().replaceWith("<h4 class='bank_title'>"+new_title+"</h4>");
        retitle_bank();
      });
      
  	})
  }	
	retitle_bank();
	
	//save the data if the selected file changes
	$('.file_select').change(function() { 
		var bank = $(this).attr('data-bank');
		var bank_option = $(this).attr('data-bank-option');
		rifff.data.banks[bank].bank_options[bank_option].file_location = $(this).val();
		rifff.saveJson();
		console.log('building sound matrix');
		rifff.buildSoundMatrix();
	});
	
	//save the data if the overplay setting changes 
	$('.overplay').unbind('click');
	$('.overplay').change(function() { 
		var bank = $(this).attr('data-bank');
		var bank_option = $(this).attr('data-bank-option');
		if ($(this).is(':checked')) { 
			rifff.data.banks[bank].bank_options[bank_option].overplay = true;
		}
		else { 
			rifff.data.banks[bank].bank_options[bank_option].overplay = false;
		}
		rifff.saveJson();
	});
	
	//save the data if the loop setting change
	$('.loop').unbind('click');
	$('.loop').change(function() { 
		var bank = $(this).attr('data-bank');
		var bank_option = $(this).attr('data-bank-option');
		if ($(this).is(':checked')) { 
			rifff.data.banks[bank].bank_options[bank_option].loop = true;
		}
		else { 
			rifff.data.banks[bank].bank_options[bank_option].loop = false;
		}
		rifff.saveJson();
	});	
	
	//add another bank option 
	$('.add_bank_option').unbind('click');
	$('.add_bank_option').click(function(){ 
	  var bank = $(this).parent().attr('data-bank');
	  rifff.data.banks[bank].bank_options.push(rifff.defaults.blank_bank_option);
	  rifff.saveJson();
	  rifff.renderBanks();
	});
	
	//add another bank  
	$('.add_bank').unbind('click');
	$('.add_bank').click(function(){
  	    rifff.data.banks.push(rifff.defaults.blank_bank);
	    rifff.saveJson();
	    rifff.renderBanks();
	});
	

	
	//remove bank option 
	$('.remove_bank_option').unbind('click');
	$('.remove_bank_option').click(function(){
	  var bank          = $(this).parent().parent().attr('data-bank');
	  var bank_option   = $(this).parent().attr('data-bank-option');
	  console.log("removing " + bank + " " + bank_option);
	  if (bank_option != 0) { 
      rifff.data.banks[bank].bank_options.splice(bank_option,1);
  	  rifff.saveJson();
  	  rifff.renderBanks();
  	}
  	else { 
  	  alert('You cannot delete the last option');
  	}
	});
		
	//remove bank 
	$('.remove_bank').unbind('click'); 
	$('.remove_bank').click(function(){ 
	  var bank = $(this).parents('.bank_container').attr('data-bank');
    if (bank != 0) {
      rifff.data.banks.splice(bank,1);
  	  rifff.saveJson();
  	  rifff.renderBanks();
  	}
  	else { 
  	  alert('You cannot delete the last bank');
  	}  
	});
	
	
	
    $(".dial").parent().mouseup(function(){
		var volume = parseInt($(".dial",this).val());
		var bank_option_key = $(".dial",this).attr('data-bank-option');
		var bank_key = $(".dial",this).attr('data-bank');
		rifff.data.banks[bank_key].bank_options[bank_option_key].volume = volume;
        console.log('new volueme = ' + volume);

		rifff.saveJson();
	});	
	
	//save settings
	$('#save_settings').unbind('click'); 
	$('#save_settings').click(function(){	 

		rifff.data.project_info.bpm = $('#bpm').val();

		rifff.data.project_info.bpl = $('#bpl').val();

		rifff.data.project_info.steps = $('#steps').val();
			
		//need to change the json to represent this... 
		$.each(rifff.data.banks, function(bank_key, bank_val){
			$.each(bank_val.bank_options, function(bank_option_key, bank_option_val){
				rifff.data.banks[bank_key].bank_options[bank_option_key].sequence.length = parseInt(rifff.data.project_info.steps) +1 ;
				$.each(rifff.data.banks[bank_key].bank_options[bank_option_key].sequence, function(key, val){
				  
				   if (val == null) { 
				     rifff.data.banks[bank_key].bank_options[bank_option_key].sequence[key] = 0;
				   } 
				});

			});
		});
		
		
		rifff.saveJson();
		rifff.renderBanks();
		rifff.writeScore();
		rifff.current_step = 0;	
	});
}
