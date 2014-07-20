

rifff.data = list_json; // this declared further up the page...
rifff.step = 0;
rifff.file_list = [] //list of the files available for this project.  
console.log("PROJECTS PAGE");

//these for when the user wants to add banks 
rifff.defaults={};
rifff.defaults.blank_bank        = {"bank_options":[{"sequence":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"volume":50,"loop":false,"overplay":false,"file_location":"","bank_option_name":"1option"},{"sequence":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"volume":49,"loop":false,"overplay":false,"file_location":"","bank_option_name":"3option"},{"sequence":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"volume":50,"loop":false,"overplay":false,"file_location":"","bank_option_name":"2option"},{"sequence":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"volume":49,"loop":false,"overplay":false,"file_location":"","bank_option_name":"4option"}],"bank_name":"new"};
rifff.defaults.blank_bank_option = {"sequence":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"volume":50,"loop":false,"overplay":false,"file_location":"","bank_option_name":"1option"};




$(document).ready(function(){ 
	$("#myS3Uploader").S3Uploader();
	//detect rifff mode
	rifff.mode = $('#mode').val();
    rifff.loadSoundsLocations();
    rifff.getProjectInfo();

  
})

rifff.loadSoundsLocations = function() {
	$.get(window.location + '/../list_files.json', function(data) { 
		
		rifff.file_list = data;
		
		rifff.file_list.sort(alphabetise)

        function alphabetise(a, b){
            if(a.name<b.name) return -1;
            if(a.name>b.name) return 1;
            return 0;
        }
		
    	rifff.loadSounds();
    	rifff.renderBanks();
    	rifff.initSettings(); 
	});
}



rifff.getProjectInfo = function() { 
	rifff.bpl = parseInt(rifff.data.project_info.bpl);
	rifff.bpm = parseInt(rifff.data.project_info.bpm);
	rifff.loop_trigger_interval = (rifff.bpl / (rifff.bpm / 60));
}



rifff.renderBanks = function(){ //loop through each bank and render it 
	
	$('#composer').html("<div id='playhead'></div>");
	
	var bank_option_element, bank_element; 
	
	$.each(rifff.data.banks, function(bank_key, bank_val){
		bank_element = $("<div data-bank='"+bank_key+"'class='bank_container'></div>");
		$('#composer').append(bank_element);
		
		//add the title to the bank
		if (rifff.mode == 'edit') {
		    $(bank_element).append("<div class='bank_header'><h4 class='bank_title'>" +bank_val.bank_name +"</h4><span class='remove_bank'>[DELETE]</span></div>");
		}
		else { 
		    $(bank_element).append("<div class='bank_header'><h4 class='bank_title'>" +bank_val.bank_name +"</h4></div>");
		}
		
		//add the bank options to the bank 
		$.each(bank_val.bank_options, function(bank_option_key, bank_option_val){ 
			bank_option_element = $("<div data-bank='"+bank_key+"' data-bank-option='"+bank_option_key+"' class='bank_option_container'></div>");
			$(bank_element).append(bank_option_element);
			//$(bank_option_element).append("<p class='bank_option_title'>" +bank_option_val.bank_option_name +"</p>");			
			rifff.renderControls(bank_option_element,bank_key, bank_option_key);
						
		});
		if (rifff.mode == 'edit') {
		    //append the button to add more options 
		    $(bank_element).append("<input type='button' class='btn add_bank_option' value='Add another option' />");
	    }
	});
	
	//append the button to add more options 
	if (rifff.mode == 'edit') {
	    $('#composer').append("<br/><input type='button' class='btn add_bank' value='Add a new bank' />");
	}
	
	rifff.attachClickEvents();
}


rifff.renderControls = function(elem, bank_key, bank_option_key) {
	var drop_down = $("<select name='file_select-"+bank_key+"-"+bank_option_key+"' data-bank='"+bank_key+"' data-bank-option='"+bank_option_key+"' class='file_select'><option>None</option></select>");
	if(rifff.data.banks[bank_key].bank_options[bank_option_key]) {
  	var value = rifff.data.banks[bank_key].bank_options[bank_option_key].file_location;
  	var volume = parseInt(rifff.data.banks[bank_key].bank_options[bank_option_key].volume);
	
	console.log(value + "for " + bank_key+"-"+bank_option_key)
	
  	$.each(rifff.file_list, function(key, val){ 
  	    
  		if (val.url === value || parseInt(val.id)== parseInt(value)) {
  			$(drop_down).append("<option value='"+val.id +"' selected data-id='"+key+"'>"+ val.name +"</option>");
  		}
  		else { 
  			$(drop_down).append("<option value='"+val.id +"' data-id='"+key+"'>"+ val.name +"</option>");
  		}
  	}); 
  	
	
  	if (rifff.mode == 'edit') { 
  		$(elem).append("<div class='play_indicator'></div>");
  	}	
  		$(elem).append(drop_down);
		
  	if 	(rifff.mode == 'edit') { 	
  		$(elem).append('<div class="dial_container"><input type="text" data-bank="'+bank_key+'" data-bank-option="'+bank_option_key+'" data-displayInput=false value="'+volume+'" class="dial"></div>');
  		$(elem).append('<input type="checkbox" data-bank="'+bank_key+'" data-bank-option="'+bank_option_key+'"  class="checkbox_control loop" name="loop" value="loop">');
  		$(elem).append('<input type="checkbox" data-bank="'+bank_key+'" data-bank-option="'+bank_option_key+'"  class="checkbox_control overplay" name="overplay" value="overplay">');

	
  		if (rifff.data.banks[bank_key].bank_options[bank_option_key].overplay) { 
  			$(".overplay", elem).attr('checked', 'checked');
  		}	
	
  		if (rifff.data.banks[bank_key].bank_options[bank_option_key].loop) { 
  			$(".loop", elem).attr('checked', 'checked');
  		}
	
  		$(".dial", elem).knob({'min':0,'max':70, 'width':30, 'height':30});
  	}
  	
  	rifff.renderSteps(elem, bank_key, bank_option_key);
  	
  	if (rifff.mode == 'edit') { 
  	    $(elem).append("<i class='icon-remove-circle remove_bank_option'></i>");
    }
  }	
}

rifff.renderSteps = function(elem, bank_key, bank_option_key) {
	
    var value, step_html;
	
  for(i=0; i<rifff.data.project_info.steps; i++) {  
  	value = rifff.data.banks[bank_key].bank_options[bank_option_key].sequence[i];
  	step_html = $("<div id='step_"+bank_key+"_"+bank_option_key+"_"+i+"' data-bank='"+bank_key+"' data-value='"+value+"' data-bank-option='"+bank_option_key+"' data-step-no='"+i+"'  class='step'  ></div>'");
  	$(elem).append(step_html);
      	if (rifff.mode == 'edit') { 
      	if (value == 1) { 
      		$(step_html).css('background-color', '#ccc');
      	}  
      	if (value == 2) { 
      		$(step_html).css('background-color', '#999');
      	}
      	if (value == 3) { 
      		$(step_html).css('background-color', '#222');
      	}
     } 	
  }
}

rifff.initSettings = function() { 
	var bpm  	  = rifff.data.project_info.bpm;
	var bpl   	= rifff.data.project_info.bpl;
	var steps 	= rifff.data.project_info.steps;	
	
	if (rifff.mode == 'edit') { 
		$('#bpm').val(bpm);
		$('#bpl').val(bpl);
		$('#steps').val(steps);
	}		
}

rifff.saveJson = function() { 
	var data = {'json': JSON.stringify(rifff.data) };
	
	$.ajax({
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},	
		type: "POST",
		url: window.location + "/../save_json.json",
		data: data, // the JSON data, as an object or string
		contentType: "application/json",
		dataType: "json", 
		success: function() { 
			console.log('saved');
		}
	});
	
	rifff.getProjectInfo();
}





