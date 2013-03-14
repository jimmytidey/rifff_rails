//HANDLES AUDIO PLAYBACK 
rifff = {};
rifff.playstate = '';
rifff.matrix_load_monitor = 0;
rifff.matrix_load_target = 0;
rifff.total_percent_loaded_array = [];
rifff.aggregate_percent_loaded=0;
rifff.total_percent_loaded=0;
var worker = new Worker('/assets/worker.js');


rifff.loadSounds = function() { 
    
	$.each(rifff.file_list, function(key, file){
	  //test to see if this file is already loaded

	  if (!$('#sound_'+file.id).is('*')) {
	    
  		rifff.loadSound(file.url, file.id)
		
  		var append_string = "<div class='row audio_file' id='sound_"+file.id+"' data-loaded='1' >";
      append_string +=    "<div class='load_indicator span1'></div>";
      append_string +=    '<div class="name span5">'+file.name+'</div>'
      append_string +=    '<div class="actions name span3">'
      append_string +=    '<a rel="nofollow" data-remote="true" data-method="delete" data-confirm="Are you sure?" href="/projects/'+project_id+'/sound_files/'+file.id+'">remove</a>'
      append_string +=    '</div>'
      append_string +=    '</div>'
    
      $('#file_list').append(append_string); 
    }   
	});
    
}

rifff.loadSound=function(location, key) {
	soundManager.createSound({
		id: "preload_"+key,
		url: location,
		autoLoad: true,
		autoPlay: false,
		onload: function() {
			$('#sound_'+key+' .load_indicator').css('background-color','green');
			$('#sound_'+key+' .load_indicator').attr('data-loaded','1');
			$('#sound_'+key+' .load_indicator').html("100%");
			soundManager.mute("preload_"+key);
			//test to see all items are loaded
			if ($(".load_indicator[data-loaded='1']").length == $(".load_indicator").length) {
			    
                window.setTimeout("rifff.buildSoundMatrix()",1000);
			}
		},
		whileloading: function(){
            soundManager.mute("preload_"+key);
            var percent_loaded = parseInt(this.bytesLoaded / this.bytesTotal * 100); 
            $('#sound_'+key+' .load_indicator').html(percent_loaded + "%");

            rifff.total_percent_loaded_array[key] = parseInt(percent_loaded); 
            rifff.updateTotalPercent();
		},
		volume: 0
	});	
    
	
}



rifff.buildSoundMatrix = function(){ 
	
	$.each(rifff.data.banks, function(bank_key, bank_val){	
		$.each(bank_val.bank_options, function(bank_option_key, bank_option_val){
			
			var location = $(".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_key+"']").val()
			
			if(typeof location != 'undefined' && location != 'None') {
			    rifff.matrix_load_target++;
			    //console.log('=====================loading  '+ location);
				soundManager.createSound({
					id: "sound_"+bank_key + '_'+bank_option_key,
					url: location,
					autoLoad: true,
					autoPlay: false,
					loops:100,
					onload: function() { //when has every sound loaded into the matrix
                        console.log('loaded');
                        rifff.matrix_load_monitor ++;
                        if (rifff.matrix_load_monitor == rifff.matrix_load_target ) {
                            
                            rifff.writeScore();
                            
                            //pretend we've loaded all the sounds up finally
                            rifff.total_percent_loaded_array.push(10000); 
                            rifff.updateTotalPercent();
                        }
                        
            		}
				}); 
				
				$(".dial[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_key+"']").parent().mouseup(function(){
					//var volume = parseInt($(".dial",this).val());
					//soundManager.setVolume("sound_"+bank_key + '_'+bank_option_key, volume);
					rifff.saveJson();
				});
				
			}	
		});

	});
	
	
	//this to destory the sounds created from the file list, however, they will be cached 
	$.each(rifff.file_list, function(key, file){
		soundManager.destroySound('preload_'+key);
	});
	
	
	
}


rifff.play = function(){ 
   
  if (rifff.playstate != 'playing' && rifff.playstate != 'first_step' ) { 
    rifff.playstate = 'first_step';
  	worker.postMessage({'action':'play', 'data': rifff.loop_trigger_interval});
  	
  	worker.onmessage = function(event){
  	    console.log('workeder message');
  		if(event.data) { //only move a step forward after the first iteration
  			rifff.current_step++;
  		}
		
  		rifff.playStep();
  		rifff.updatePlayhead();
  	};
  }
}

rifff.playStep = function(){ 
	
	var play_array = rifff.score[rifff.current_step];
	
	$.each(play_array, function(bank_key,bank_value){
		console.log(bank_value);
		
		//if there is a value in the score stop allsounds and play it ...
	    
		if(typeof bank_value['bank_option'] != undefined) {
		    
		    //this is in the middle of playback and this is not a run on 
		    if(bank_value['time']==0 && rifff.playstate=='playing') {

    			//stop all other sounds in this bank
    			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val){
    				soundManager.stop("sound_"+bank_key + '_'+bank_option_key);
    			});
			
    			rifff.play_sound(bank_key, bank_value['bank_option'], bank_value['time']);
    		}
    		
    		//this is the first step, so play everything 
    		else if (rifff.playstate=='first_step'){ 

    			//stop all other sounds in this bank
    			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val){
    				soundManager.stop("sound_"+bank_key + '_'+bank_option_key);
    			});
			
    			rifff.play_sound(bank_key, bank_value['bank_option'], bank_value['time']);
    		}
			
		} else {
			
			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val){
				
				var overplay = $(".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_key+"'] .overplay").is(':checked');
			
				if(!overplay) {
					soundManager.stop("sound_"+bank_key + '_'+bank_option_key);
				}
			});	
				
		}	
	});
	
	if (rifff.playstate == 'first_step') { 
	    rifff.playstate == 'playing'; 
	}
}


rifff.play_sound = function(bank_key, bank_option, time) { 

    console.log('PLAY: bank_key:' + bank_key + 'bank_option' + bank_option);

    var indicator = $(".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"'] .play_indicator");
    var loop = $(".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"'] .loop").is(':checked');
	
	

    if(loop) {
        console.log('lloooooppininh');
    	soundManager.play("sound_"+bank_key + '_'+bank_option,{
    		onplay: function() {
    	    	$(indicator).css('background-color', 'red');
    	  	},
    		onfinish: function() {
    	    	$(indicator).css('background-color', 'white');
    	  	},
    		onstop: function() {
    	    	$(indicator).css('background-color', 'white');
    	  	},
    		bufferTime: 0,
    		position: time,
    		loops:100,
    		autoLoad:true
    	});
    }
    
    else {
        console.log('not looping');
    	soundManager.play("sound_"+bank_key + '_'+bank_option,{
    		onplay: function() {
    	    	$(indicator).css('background-color', 'red');
    	  	},
    		onfinish: function() {
    	    	$(indicator).css('background-color', 'white');
    	  	},
    		onstop: function() {
    	    	$(indicator).css('background-color', 'white');
    	  	},
    		bufferTime: 0,
    		position: time,
    		loops:0,
    		autoLoad:true
    	});
    }
}

rifff.stop = function(){ 
  rifff.playstate = 'stopped';
	worker.postMessage({'action':'stop'});
	soundManager.stopAll();
}

rifff.updateTotalPercent = function() {
    
    if ($('#composer #total_percent_loaded').length ==0) { 
        var html ="<div class='progress progress-striped active' id='total_percent_loaded'><div class='bar' style='width: 0%;'></div></div>";
        $('#composer').prepend(html);
    }
    
    rifff.aggregate_percent_loaded = 0; 
    rifff.no_of_files = 0; 
    
    $.each(rifff.total_percent_loaded_array, function(key,val) {
        if(typeof val !== 'undefined') {
            //console.log(parseInt(val) + " KEY: " + key);
            rifff.aggregate_percent_loaded += parseInt(val);
            rifff.no_of_files++; 
        }    
    });
    
    //little hack so the final bit of loading only happens when it's built the sound matrix 
    rifff.total_percent_loaded = (rifff.aggregate_percent_loaded/rifff.no_of_files)-10 ;
   
    $('#total_percent_loaded .bar').css('width', rifff.total_percent_loaded + "%");
    
    if(rifff.total_percent_loaded >= 100) { 
        $('#composer #total_percent_loaded').remove();
         
    }
  
}
