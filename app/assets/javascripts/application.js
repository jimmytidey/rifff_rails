// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require twitter/bootstrap
//= require jquery-fileupload/basic

rifff = {};

rifff.data = list_json;
rifff.step = 0;
rifff.number_of_steps = list_json.banks[0].bank_options[0].sequence.length;
rifff.file_list = [] //list of the files available for this project.  



$(document).ready(function(){ 
	//load the ajax list of sound locations 
	rifff.loadSoundsLocations();
})

rifff.loadSoundsLocations = function() {
	$.get(window.location + '/list_files.json', function(data) { 
		rifff.file_list = data.soundfiles;
		rifff.renderBanks();
	});
}



rifff.getProjectInfo = function() { 
	rifff.bpl = rifff.json.project_info.bpl;
	rifff.bpm = rifff.json.project_info.bpm;
	rifff.number_of_steps = parseInt(rifff.json.project_info.steps);
	rifff.loop_trigger_interval = rifff.bpm / 60 / rifff.bpl;
}

rifff.writeScore = function() { 
	
	var options_in_bank; 
	var option_choice = []; 
	
	//declare the score array
	rifff.score = [];
	for (i = 0; i<rifff.number_of_steps; i++) { 
		rifff.score[i] = [];
	}
	
	//loop through an make the choices 
	$.each(rifff.score, function(step_key, step_val) { 
		$.each(rifff.data.banks, function(bank_key, value){ 
			options_in_bank = rifff.json.banks[bank_key].bank_options.length - 2; 
			
			//check if there are any certain options 
			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val) { 
				if (rifff.data.banks[bank_key].bank_options  == 3) { 
				 	option_choice.push(bank_option_key); 
				}
			});
			

			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val) { 
				if ( rifff.data.banks[bank_key].bank_options[bank_option_key]  == 3 ) { 
				 	option_choice.push(bank_option_key);
				}
			});
			
			option_choice = Math.floor(Math.random()*options_in_bank);
			console.log("step:" + step_key + " Bank: " + bank_key + " choice " + option_choice);
			rifff.score[step_key][bank_key] = option_choice;
		});
	});
}

rifff.renderBanks = function(){ //loop through each bank and render it 
	
	var bank_option_element, bank_element; 
	
	$.each(rifff.data.banks, function(bank_key, bank_val){
		bank_element = $("<div data-bank='"+bank_key+"'class='bank_container'></div>");
		$('#composer').append(bank_element);
		
		//add the title to the bank
		$(bank_element).append("<p class='bank_title'>" +bank_val.bank_name +"</p>");
		
		//add the bank options to the bank 
		$.each(bank_val.bank_options, function(bank_option_key, bank_option_val){ 
			bank_option_element = $("<div data-bank='"+bank_key+"' data-bank-option='"+bank_option_key+"' class='bank_option_container'></div>");
			$(bank_element).append(bank_option_element);
			$(bank_option_element).append("<p class='bank_option_title'>" +bank_option_val.bank_option_name +"</p>");			
			rifff.renderDropDown(bank_option_element,bank_key, bank_option_key);
			rifff.renderSteps(bank_option_element, bank_key, bank_option_key);			
		});
	});
	
	rifff.attachClickEvents();
}


rifff.renderDropDown = function(elem, bank_key, bank_option_key) {
	var drop_down = $("<select data-bank='"+bank_key+"' data-bank-option='"+bank_option_key+"' class='file_select'><option>None</option></select>");
	var value = rifff.data.banks[bank_key].bank_options[bank_option_key].file_location;
	
	$.each(rifff.file_list, function(key, val){ 
		if (val.location === value) {
			$(drop_down).append("<option selected data-id='"+key+"'>"+ val.name +"</option>");
		}
		else { 
				$(drop_down).append("<option value='"+val.location +"' data-id='"+key+"'>"+ val.name +"</option>");
		}
	}); 

	$(elem).append(drop_down);	
}

rifff.renderSteps = function(elem, bank_key, bank_option_key) {
	
	var value, step_html;
	
	for(i=0; i<rifff.number_of_steps; i++) {  
		value = rifff.data.banks[bank_key].bank_options[bank_option_key].sequence[i];
		step_html = $("<div data-bank='"+bank_key+"' data-value='"+value+"' data-bank-option='"+bank_option_key+"' data-step-no='"+i+"' class='step'  ></div>'");
		$(elem).append(step_html);
		if (value == 1) { 
			$(step_html).css('background-color', '#eee');
		}  
		if (value == 2) { 
			$(step_html).css('background-color', '#999');
		}
		if (value == 3) { 
			$(step_html).css('background-color', '#222');
		}
	}
}

rifff.attachClickEvents = function() {
		 
	$('.step').click(function(){

		var value = parseInt($(this).attr('data-value'));
		var bank = $(this).attr('data-bank');
		var bank_option = $(this).attr('data-bank-option');
		var step = $(this).attr('data-step-no');
		
		
		value = value+1;
		
		if (value == 1) { 
			$(this).css('background-color', '#eee');
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
		//console.log(rifff.data.banks[bank].bank_options[bank_option].sequence);
		rifff.saveJson();
		
	});
	
	$('.file_select').change(function() { 
		var bank = $(this).attr('data-bank');
		var bank_option = $(this).attr('data-bank-option');
		rifff.data.banks[bank].bank_options[bank_option].file_location = $(this).val();
		rifff.saveJson();
	});
}

rifff.saveJson = function() { 
	var data = {'json': JSON.stringify(rifff.data) };
	console.log('saving');
	$.ajax({
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},	
		type: "POST",
		url: window.location + "/save_json.json",
		data: data, // the JSON data, as an object or string
		contentType: "application/json",
		dataType: "json", 
		success: function() { 
			console.log('saved');
		}
	});
}

rifff.renderScore = function() { 
	
}





