//HANDLES AUDIO PLAYBACK 

rifff = {};
rifff.playstate = '';
rifff.audioBuffers = [];
var context = new webkitAudioContext();
rifff.sounds=[];
rifff.current_step=0;

rifff.lookahead = -1;

rifff.files_loaded = 0;

rifff.build_sound_matrix_test = true;
var worker = new Worker('/assets/worker.js');

rifff.loadSounds = function() {    
    
    console.log('loading sounds...');
    
    $(document).ready(function(){
        
        if($('#total_percent_loaded').length == 0) {    
            var html ="<div class='progress progress-striped active' id='total_percent_loaded'><div class='bar' style='width: 0%;'></div></div>";
            
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
	var request = new XMLHttpRequest();
	request.open('GET', location, true);
	request.responseType = 'arraybuffer';
	
	if (typeof rifff.audioBuffers[key] === "undefined") { 
		rifff.audioBuffers[key] = [];
	}

	// Decode asynchronously
	request.onload = function() {
		    context.decodeAudioData(request.response, function(buffer) {
			
			rifff.audioBuffers[key] = buffer;
			
			//console.log('LOADED------------>URL: ' +  location + " ID: " + key );
			$('#sound_'+key+' .load_indicator').css('background-color','green');
			$('#sound_'+key+' .load_indicator').attr('data-loaded','1');
			$('#sound_'+key+' .load_indicator').html("100%");

			rifff.files_loaded++;
			rifff.updateTotalPercent();
			
			//test to see all items are loaded
			if (rifff.files_loaded >= rifff.file_list.length) {
                rifff.buildSoundMatrix();
                
			}

		});
	}
	request.send();
	
    /*
		whileloading: function(){
            soundManager.mute("preload_"+key);
            var percent_loaded = parseInt(this.bytesLoaded / this.bytesTotal * 100); 
            $('#sound_'+key+' .load_indicator').html(percent_loaded + "%");
		},
	*/	

}

rifff.buildSoundMatrix = function(){ 

	
    rifff.files_loaded = rifff.files_loaded+1;
    rifff.updateTotalPercent();
    rifff.writeScore();
}


rifff.play = function(){
    
    rifff.loop_trigger_interval =  (rifff.bpl / (rifff.bpm / 60));
    rifff.audio_context_offset = context.currentTime;
    console.log('Audio context offset ' + rifff.audio_context_offset);
    
    if(rifff.current_step == 0 ) { 
        rifff.programmeStep(rifff.current_step);
    }
    else { 
         rifff.programmeStep(rifff.current_step-1);
    }
    rifff.shedule_timer = setInterval("rifff.shedule()", 100);
    rifff.step_timer = setInterval("rifff.stepUpdater()", rifff.loop_trigger_interval*1000);
    
    
}


rifff.stepUpdater = function() { 
    rifff.current_step++;   
    rifff.updatePlayhead();
    console.log("MOVED TO STEP:" + rifff.current_step + " at time " + context.currentTime);
}




rifff.shedule = function() { 
    if (rifff.current_step+1 != rifff.lookahead) {//lookahead to the next step and programme in when it should play
        
        shedule_step = parseInt(rifff.current_step)+1; 
            
    	console.log('sheduling next step ' + shedule_step);
    	
        rifff.programmeStep(shedule_step)
        rifff.lookahead=shedule_step;
    }	
}


rifff.programmeStep =function(step) { 
	var play_array = rifff.score[step];
    console.log('programming step:' + step);
    $.each(play_array, function(bank_key,bank_value){

        //if there is a value in the score stop allsounds and play it ...
        if(typeof bank_value['bank_option'] !== 'undefined') {
             rifff.playSound(bank_key, bank_value['bank_option'], (step * rifff.loop_trigger_interval)+rifff.audio_context_offset, bank_value['time']);
        }        
            
    });    
}

rifff.playSound = function(bank_key, bank_option, time, offset) {
    
    var offtime = time+rifff.loop_trigger_interval; 
    var id = $(".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"']").val()

    var sound_location =  rifff.sounds.push(context.createBufferSource())-1;
    
	rifff.sounds[sound_location].buffer = rifff.audioBuffers[id];
    rifff.sounds[sound_location].connect(context.destination);  
    
    console.log('PLAY: bank_key:' + bank_key + 'bank_option' + bank_option + " at " + time + " with offset " + offset + " and turn off at"+ offtime);

    var indicator = $(".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"'] .play_indicator");
    var loop = $(".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"'] .loop").is(':checked');
    rifff.sounds[sound_location].start(time, offset, 1000);
    rifff.sounds[sound_location].noteOff(time+rifff.loop_trigger_interval);
}

rifff.stop = function(){ 
    clearInterval(rifff.shedule_timer);
    clearInterval(rifff.step_timer);
    rifff.lookahead = -1;
    $.each(rifff.sounds, function(key, val){	
            val.stop(0);
    });
}

rifff.updateTotalPercent = function() {
    
    var percent_loaded = ((rifff.files_loaded-1) / rifff.file_list.length) * 100;
    
    $('#total_percent_loaded .bar').css('width', percent_loaded + "%");

    
    if(percent_loaded >= 100) { 
        $('#total_percent_loaded').remove();     
    }
}
