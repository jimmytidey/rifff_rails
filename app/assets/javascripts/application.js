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
//= require audio.js
//= require score.js
//= require transport.js
//= require knob.js
//= require soundmanager2



rifff.data = list_json;
rifff.step = 0;
rifff.file_list = [] //list of the files available for this project.  



$(document).ready(function(){ 
	//load the ajax list of sound locations 
	rifff.loadSoundsLocations();
	rifff.getProjectInfo();
})

rifff.loadSoundsLocations = function() {
	$.get(window.location + '/list_files.json', function(data) { 
		rifff.file_list = data.soundfiles;
		
		$.each(rifff.file_list, function(key,val){ 
			var offset;
			val.name = val.location.split('/');
			offset = val.name.length;
			val.name = val.name[offset-1]
		});
		
		rifff.renderBanks();
		rifff.writeScore();
		//rifff.loadSounds();
	});
}



rifff.getProjectInfo = function() { 
	rifff.bpl = rifff.data.project_info.bpl;
	rifff.bpm = rifff.data.project_info.bpm;
	rifff.loop_trigger_interval = rifff.bpm / 60 / rifff.bpl;
	rifff.initSettings(); 
}



rifff.renderBanks = function(){ //loop through each bank and render it 
	
	$('#composer').html("<div id='playhead'></div>");
	
	var bank_option_element, bank_element; 
	
	$.each(rifff.data.banks, function(bank_key, bank_val){
		bank_element = $("<div data-bank='"+bank_key+"'class='bank_container'></div>");
		$('#composer').append(bank_element);
		
		//add the title to the bank
		$(bank_element).append("<h4 class='bank_title'>" +bank_val.bank_name +"</h4>");
		
		//add the bank options to the bank 
		$.each(bank_val.bank_options, function(bank_option_key, bank_option_val){ 
			bank_option_element = $("<div data-bank='"+bank_key+"' data-bank-option='"+bank_option_key+"' class='bank_option_container'></div>");
			$(bank_element).append(bank_option_element);
			$(bank_option_element).append("<p class='bank_option_title'>" +bank_option_val.bank_option_name +"</p>");			
			rifff.renderControls(bank_option_element,bank_key, bank_option_key);
						
		});
	});
	
	rifff.attachClickEvents();
}


rifff.renderControls = function(elem, bank_key, bank_option_key) {
	var drop_down = $("<select data-bank='"+bank_key+"' data-bank-option='"+bank_option_key+"' class='file_select'><option>None</option></select>");
	var value = rifff.data.banks[bank_key].bank_options[bank_option_key].file_location;
	var volume = parseInt(rifff.data.banks[bank_key].bank_options[bank_option_key].volume);
	
	$.each(rifff.file_list, function(key, val){ 
		if (val.location === value) {
			$(drop_down).append("<option selected data-id='"+key+"'>"+ val.name +"</option>");
		}
		else { 
				$(drop_down).append("<option value='"+val.location +"' data-id='"+key+"'>"+ val.name +"</option>");
		}
	}); 
	
	$(elem).append("<div class='play_indicator'></div>");	
	$(elem).append(drop_down);	
	$(elem).append('<div class="dial_container"><input type="text" data-bank="'+bank_key+'" data-bank-option="'+bank_option_key+'" data-displayInput=false value="'+volume+'" class="dial"></div>');
	$(elem).append('<input type="checkbox" data-bank="'+bank_key+'" data-bank-option="'+bank_option_key+'"  class="checkbox_control loop" name="loop" value="loop">');
	$(elem).append('<input type="checkbox" data-bank="'+bank_key+'" data-bank-option="'+bank_option_key+'"  class="checkbox_control overplay" name="overplay" value="overplay">');
	
	if (rifff.data.banks[bank_key].bank_options[bank_option_key].overplay) { 
		$(".overplay", elem).attr('checked', 'checked');
	}	
	
	if (rifff.data.banks[bank_key].bank_options[bank_option_key].loop) { 
		$(".loop", elem).attr('checked', 'checked');
	}
	
	$(".dial", elem).knob({'min':0,'max':100, 'width':30, 'height':30});
	
	rifff.renderSteps(elem, bank_key, bank_option_key);
	
}

rifff.renderSteps = function(elem, bank_key, bank_option_key) {
	
	var value, step_html;
	
	for(i=0; i<rifff.data.project_info.steps; i++) {  
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

rifff.initSettings = function() { 
	var bpm  	= rifff.data.project_info.bpm;
	var bpl   	= rifff.data.project_info.bpl;
	var steps 	= rifff.data.project_info.steps;	
	
	$('#bpm').val(bpm);
	$('#bpl').val(bpl);
	$('#steps').val(steps);	
	
	$('#bpm').change(function(){
		rifff.data.project_info.bpm = $(this).val();
		rifff.saveJson();
	});

	$('#bpl').change(function(){
		rifff.data.project_info.bpl = $(this).val();
		rifff.saveJson();
	});
	
	$('#steps').change(function(){
		rifff.data.project_info.steps = $(this).val();
		rifff.saveJson();
		
		//need to change the json to represent this... 
		$.each(rifff.data.banks, function(bank_key, bank_val){
			$.each(bank_val.bank_options, function(bank_option_key, bank_option_val){
				rifff.data.banks[bank_key].bank_options[bank_option_key].sequence.length = rifff.data.project_info.steps +1 ;
			});
		});
	
		rifff.renderBanks();
	});		
	
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
		rifff.saveJson();
		
	});
	
	//save the data if the selected file changes
	$('.file_select').change(function() { 
		var bank = $(this).attr('data-bank');
		var bank_option = $(this).attr('data-bank-option');
		rifff.data.banks[bank].bank_options[bank_option].file_location = $(this).val();
		rifff.saveJson();
	});
	
	//save the data if the overplay setting changes 
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
}

rifff.saveJson = function() { 
	var data = {'json': JSON.stringify(rifff.data) };
	
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






