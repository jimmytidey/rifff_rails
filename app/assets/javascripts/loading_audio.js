rifff.loadSounds = function() { 
    
    //define the sounds matrix
    rifff.sounds=[];
    for(bank=0; bank<rifff.data.banks.length; bank++) {
        rifff.sounds[bank]=[];
        for (bank_option=0; bank_option<rifff.data.banks[bank].bank_options.length; bank_option++) {
            rifff.sounds[bank][bank_option] = [];
        }
    }

    rifff.gains=[];
    for(bank=0; bank<rifff.data.banks.length; bank++) {
        rifff.gains[bank]=[];
        for (bank_option=0; bank_option<rifff.data.banks[bank].bank_options.length; bank_option++) {
            rifff.gains[bank][bank_option] = [];
        }
    }
    
    $(document).ready(function(){
        if($('#total_percent_loaded').length === 0) {    
            var html ="<div class='span12 progress progress-striped active' id='total_percent_loaded'><div class='bar' style='width: 0%;'></div></div>";
            
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
            append_string +=    '<div class="name span1"><i class="icon-volume-up"></i></div>';
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
	
	//hack to make it use cloudfront 
	var new_location = location.replace('https://s3.amazonaws.com/rifff_bucket/',  'http://dyq8q1jskzeck.cloudfront.net/');
	
	request.open('GET', new_location, true);
	request.responseType = 'arraybuffer';
	
	if (typeof rifff.audioBuffers[key] === "undefined") { 
		rifff.audioBuffers[key] = [];
	}

	// Decode asynchronously
	request.onload = function() {
		    context.decodeAudioData(request.response, function(buffer) {
			
			rifff.audioBuffers[key] = buffer;
			
			//console.log('LOADED------------>URL: ' +  new_location + " ID: " + key );
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

rifff.updateTotalPercent = function() {
    
    var percent_loaded = (((rifff.files_loaded) / rifff.file_list.length) * 100)+3;
    
    $('#total_percent_loaded .bar').css('width', percent_loaded + "%");
    
    if(percent_loaded >= 100) { 
        $('#total_percent_loaded').remove();     
    }
}