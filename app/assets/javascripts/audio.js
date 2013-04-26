//HANDLES AUDIO PLAYBACK 

rifff = {};
rifff.playstate = '';
rifff.audioBuffers = [];
var context = new webkitAudioContext();
rifff.sounds=[];
rifff.gains=[];
rifff.current_step=0;

rifff.lookahead = -1;

rifff.files_loaded = 0;

rifff.build_sound_matrix_test = true;
var worker = new Worker('/assets/worker.js');

rifff.loadSounds = function() {    
    
    console.log('loading sounds...');
    
    $(document).ready(function(){
        if($('#total_percent_loaded').length === 0) {    
            var html ="<div class='progress progress-striped active' id='total_percent_loaded'><div class='bar' style='width: 0%;'></div></div>";
            
            $('#composer').before(html);
        }
    });

     
	$.each(rifff.file_list, function(key, file){
	  //test to see if this file is already loaded
        if (!$('#sound_'+file.id).is('*')) {

            rifff.loadSound(file.url, file.id);

            var append_string = "<div class='row audio_file' id='sound_"+file.id+"' data-loaded='1' >";
            append_string +=    "<div class='load_indicator span1'></div>";
            append_string +=    '<div class="name span5">'+file.name+'</div>';
            append_string +=    '<div class="actions name span3">';
            append_string +=    '<a rel="nofollow" data-remote="true" data-method="delete" data-confirm="Are you sure?" href="/projects/'+project_id+'/sound_files/'+file.id+'">remove</a>';
            append_string +=    '</div>';
            append_string +=    '</div>';

            $('#file_list').append(append_string); 
        }   
	});
};

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
}

rifff.buildSoundMatrix = function(){ 
    rifff.files_loaded = rifff.files_loaded+1;
    rifff.updateTotalPercent();
    rifff.writeScore();
}


rifff.play = function(){ 
    rifff.loop_trigger_interval =  (rifff.bpl / (rifff.bpm / 60));
    rifff.shedule();
    rifff.step_timer = setInterval("rifff.stepUpdater()", rifff.loop_trigger_interval*1000);
}


rifff.stepUpdater = function() {
    rifff.current_step++;   
    rifff.updatePlayhead();
    console.log("MOVED TO STEP:" + rifff.current_step + " at time " + context.currentTime);
}




rifff.shedule = function() {
    var steps_into_future = 0;
    var bank_option_to_play;
    var time_to_play;
    var sample_offset;
    
    
    rifff.timeOffset = context.currentTime; 
    
    for(step_key=rifff.current_step; step_key< rifff.score.length; step_key++) {
      
        time_to_play = (steps_into_future * rifff.loop_trigger_interval) + rifff.timeOffset; 
        console.log('writing schedule for ' + step_key);
        
        for(bank_key=0; bank_key<rifff.data.banks.length; bank_key++) {
            
            if(typeof rifff.score[step_key][bank_key]['bank_option'] !== 'undefined' && (rifff.score[step_key][bank_key]['time']===0 || steps_into_future===0 )){
                bank_option_to_play = rifff.score[step_key][bank_key]['bank_option'];
                sample_offset       = rifff.score[step_key][bank_key]['time'];
                rifff.playSound(bank_key, bank_option_to_play, time_to_play, sample_offset);
            }    
        }
        steps_into_future++;
    }
}



rifff.playSound = function(bank_key, bank_option, time, offset) {
    
    //make source node
    var selector =".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option+"']"; 
    var id = $(selector).val();
    var sound_location =  rifff.sounds.push(context.createBufferSource())-1;
    rifff.sounds[sound_location].buffer = rifff.audioBuffers[id];
    
    //calculate MP3 delay
    var sample_rate = rifff.sounds[sound_location].buffer.sampleRate;
    var duration = rifff.sounds[sound_location].buffer.duration;
    var delay_amount = (1/sample_rate) *512;
    offset = parseFloat(offset + delay_amount);
    

	
	 	
	//set the gain of this node 
	rifff.gains[sound_location] = context.createGainNode();
    rifff.sounds[sound_location].connect(rifff.gains[sound_location]);
    rifff.gains[sound_location].gain.value = rifff.data.banks[bank_key].bank_options[bank_option].volume /100;
    //console.log("vol set to" + rifff.data.banks[bank_key].bank_options[bank_option].volume /100); 
    rifff.gains[sound_location].connect(context.destination);

    //set the duration
    var duration
    if(rifff.loop_trigger_interval- offset < rifff.sounds[sound_location]['buffer']['duration']) {
        duration = rifff.loop_trigger_interval - offset; 
    }
    else { 
        duration = rifff.sounds[sound_location]['buffer']['duration'] - offset;
    }
    
    //if overplay is on 
    if(rifff.data.banks[bank_key].bank_options[bank_option].overplay) {
        duration = parseFloat(rifff.sounds[sound_location]['buffer']['duration'] - offset);
        
        //check forward to see if voice steeling should happen 
        
        
    }
    
    //add looping to this sample, if it's turned on
	if(rifff.data.banks[bank_key].bank_options[bank_option].loop) {
	    rifff.sounds[sound_location].loop = true;
	    rifff.sounds[sound_location].loopStart= delay_amount;
	    rifff.sounds[sound_location].loopEnd= rifff.sounds[sound_location]['buffer']['duration']-(delay_amount *2);
	    offset=0;
	    rifff.sounds[sound_location].noteOn(time);
	    rifff.sounds[sound_location].noteOff(parseFloat(rifff.loop_trigger_interval + time));
	}
	else {
        console.log('PLAY: bank_key:' + bank_key + 'bank_option' + bank_option + " at " + time + " with offset " + offset + " with duration "+ duration);
        rifff.sounds[sound_location].noteGrainOn(time, offset, duration);
    }
}

rifff.stop = function(){ 
    clearInterval(rifff.step_timer);
    $.each(rifff.sounds, function(key, val){
            val.noteOff(0);
    });
    rifff.sounds = [];
}

rifff.updateTotalPercent = function() {
    
    var percent_loaded = ((rifff.files_loaded-1) / rifff.file_list.length) * 100;
    
    $('#total_percent_loaded .bar').css('width', percent_loaded + "%");
    
    if(percent_loaded >= 100) { 
        $('#total_percent_loaded').remove();     
    }
}
