//HANDLES AUDIO PLAYBACK 
console.log("AUDIO PAGE");
rifff = {};
rifff.playstate = '';


rifff.files_loaded = 0;

rifff.build_sound_matrix_test = true;
var worker = new Worker('/assets/worker.js');

rifff.loadSounds = function() {    
    
    console.log('loading sounds...');
    
    $(document).ready(function(){
        
        if($('#total_percent_loaded').length == 0) {    
            var html ="<div class='progress progress-striped active' id='total_percent_loaded'><div class='bar' style='width: 0%;'></div></div>";
            console.log('no comp?' + $('#composer'));
            $('#composer').before(html);
        }
    });

     
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

rifff.loadSound = function(location, key) {
	soundManager.createSound({
		id: "preload_"+key,
		url: location,
		autoLoad: true,
		autoPlay: false,
		onload: function() {
		    //console.log('LOADED------------>URL: ' +  location + " ID: " + key );
			$('#sound_'+key+' .load_indicator').css('background-color','green');
			$('#sound_'+key+' .load_indicator').attr('data-loaded','1');
			$('#sound_'+key+' .load_indicator').html("100%");

			soundManager.mute("preload_"+key);
			
			rifff.files_loaded++;
			rifff.updateTotalPercent();
			
			//test to see all items are loaded
			if ($(".load_indicator[data-loaded='1']").length === $(".load_indicator").length && rifff.build_sound_matrix_test) {
                window.setTimeout("rifff.buildSoundMatrix()",1000);
                rifff.build_sound_matrix_test = false
			}
		},
		whileloading: function(){
            soundManager.mute("preload_"+key);
            var percent_loaded = parseInt(this.bytesLoaded / this.bytesTotal * 100); 
            $('#sound_'+key+' .load_indicator').html(percent_loaded + "%");
		},
		volume: 0
	});	
}

rifff.buildSoundMatrix = function(){ 
    rifff.matrix_load_monitor = 0;
    rifff.matrix_load_target = 0;
	console.log('sound matrix being writen');
	$.each(rifff.data.banks, function(bank_key, bank_val){	
		$.each(bank_val.bank_options, function(bank_option_key, bank_option_val){
			
			soundManager.destroySound("sound_"+bank_key + '_'+bank_option_key);
			
			var location = $(".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_key+"']").val()
			 
			
			if(typeof location != 'undefined' && location != 'None') {
			    rifff.matrix_load_target++;

				soundManager.createSound({
					id: "sound_"+bank_key + '_'+bank_option_key,
					url: location,
					autoLoad: true,
					autoPlay: false,
					loops:100,
					onload: function() { //when has every sound loaded into the matrix
                        rifff.matrix_load_monitor ++;
                        console.log('loaded' + rifff.matrix_load_monitor + 'of' + rifff.matrix_load_target);
                        if (rifff.matrix_load_monitor >= rifff.matrix_load_target ) {
                            //pretend we've loaded all the sounds up finally
                            rifff.files_loaded = rifff.files_loaded+1;
                            rifff.updateTotalPercent();
                            rifff.writeScore();
                        }
            		}
				}); 
				
				$(".dial[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_key+"']").parent().mouseup(function(){
					var volume = parseInt($(".dial",this).val());
					soundManager.setVolume("sound_"+bank_key + '_'+bank_option_key, volume);
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
    	    //console.log('workeder message');
    		if(event.data) { //only move a step forward after the first iteration
    			rifff.current_step++;
    		}
	
    		rifff.playStep();
    		rifff.updatePlayhead();
    	};
    }
  
  	if (rifff.playstate === 'first_step') { 
	    rifff.playstate = 'playing'; 
	}

}

rifff.playStep = function(){ 
	
	var play_array = rifff.score[rifff.current_step];
	

	
	$.each(play_array, function(bank_key,bank_value){
		
		//if there is a value in the score stop allsounds and play it ...
		
		
		if(typeof bank_value['bank_option'] != undefined) {
		    
    		//stop all other sounds in this bank
    		$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val){
    			soundManager.stop("sound_"+bank_key + '_'+bank_option_key);
    		});
	
    		rifff.play_sound(bank_key, bank_value['bank_option'], bank_value['time']);
			
		} else {
			
			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val){
				
				var overplay = rifff.data.banks[bank_key].bank_options[bank_option_key].overplay;
			
				if(overplay) {
					soundManager.stop("sound_"+bank_key + '_'+bank_option_key);
				}
			});	
				
		}	
	});
}


rifff.play_sound = function(bank_key, bank_option, time) { 

    console.log('PLAY: bank_key:' + bank_key + 'bank_option' + bank_option);

    var indicator = $(".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"'] .play_indicator");
    var loop = $(".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"'] .loop").is(':checked');
	
	

    if(loop) {
        
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
    
    var percent_loaded = ((rifff.files_loaded-1) / rifff.file_list.length) * 100;
    
    $('#total_percent_loaded .bar').css('width', percent_loaded + "%");

    
    if(percent_loaded >= 100) { 
        $('#total_percent_loaded').remove();     
    }
}
