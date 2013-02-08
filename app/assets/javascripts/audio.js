rifff = {};
rifff.buffers = [];
rifff.players = [];

console.log("AUDIO PAGE");
//var context = new webkitAudioContext();
var worker = new Worker('/assets/worker.js');

$(document).ready(function(){ 
  rifff.mode = $('#mode').val();
  
  //only init on audio pages
  if (typeof rifff.mode != 'undefined') { 
  	$('#play').click(function(){
  	  console.log('playing');
  		rifff.play();
  	});
	
  	$('#stop').click(function(){
  		rifff.stop();
  	});
	
  	soundManager.setup({
  		url: '/	assets/swf/soundmanager2.swf',
  		useHTML5Audio: true,
  		preferFlash: false,
  		useHighPerformance: true,
  		debugMode: false,
  	});
  	soundManager.onready(function() {
  		rifff.loadSounds();
  	});
  }	
});


rifff.loadSounds = function() { 
	$.each(rifff.file_list, function(key, file){
		rifff.loadSound(file.url, file.id)
		
		var append_string = "<div class='row audio_file' id='sound_"+file.id+">' >";
    append_string +=    "<div class='load_indicator span1'></div>";
    append_string +=    'div class="name span5">'+file.name+'</div>'
    append_string +=    '<div class="actions name span3">'
    append_string +=    '<a rel="nofollow" data-remote="true" data-method="delete" data-confirm="Are you sure?" href="/projects/11/sound_files/"'+file.id+'">remove</a>'
    append_string +=    '</div>'
    append_string +=    '</div>'
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
			
			//test to see all items are loaded
			if ($(".load_indicator[data-loaded='1']").length == $(".load_indicator").length) {
			    rifff.buildSoundMatrix();
			}
		},
		whileloading: function(){
			var percent_loaded = parseInt(this.bytesLoaded / this.bytesTotal * 100); 
			$('#sound_'+key+' .load_indicator').html(percent_loaded + "%");
		},
		volume: 50
	});	
	
}

rifff.buildSoundMatrix = function(){ 
	
	$.each(rifff.file_list, function(key, file){
		soundManager.destroySound('preload_'+key);
	});
	
	$.each(rifff.data.banks, function(bank_key, bank_val){	
		$.each(bank_val.bank_options, function(bank_option_key, bank_option_val){
			
			var sound_id = $(".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_key+"']").find('[selected]').attr('data-id');
			if(typeof sound_id != 'undefined' ) {
				var location = rifff.file_list[sound_id].location; 
				soundManager.createSound({
					id: "sound_"+bank_key + '_'+bank_option_key,
					url: location,
					autoLoad: true,
					autoPlay: false,
				}); 
				
				$(".dial[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_key+"']").parent().mouseup(function(){
					var volume = parseInt($(".dial",this).val());
					soundManager.setVolume("sound_"+bank_key + '_'+bank_option_key, volume);
					rifff.saveJson();
				});
				
			}	
		});

	});
}


rifff.play = function(){ 
	worker.postMessage({'action':'play', 'data': rifff.loop_trigger_interval});
	rifff.loop_trigger_interval
	worker.onmessage = function(event){
		if(event.data) { //only move a step forward after the first iteration
			rifff.current_step++;
		}
		
		rifff.playStep();
		rifff.updatePlayhead();
	};
	
}

rifff.playStep = function(){ 
	console.log(">>>>>>>"+rifff.current_step);
	var play_array = rifff.score[rifff.current_step];
	
	$.each(play_array, function(bank_key,bank_value){
		console.log(bank_value);
		
		
		if(bank_value !== '-') {
			
			//look and get whatever sound is selected for this source
			
			//stop all other sounds in this bank
			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val){
				soundManager.stop("sound_"+bank_key + '_'+bank_option_key);
			});
			
			var indicator = $(".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+bank_value+"'] .play_indicator");
			var loop = $(".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+bank_value+"'] .loop").is(':checked');
			
			
			function play_sound() { 
				console.log('happening!');
				soundManager.play("sound_"+bank_key + '_'+bank_value,{
					onplay: function() {
				    	$(indicator).css('background-color', 'red');
				  	},
					onfinish: function() {
				    	$(indicator).css('background-color', 'white');
					
						if(loop) { 
							 play_sound();
						}
				  	},
					onstop: function() {
				    	$(indicator).css('background-color', 'white');
				  	},
					bufferTime: 0
				});
			}	
			
			play_sound();
			
			
		} else {
			
			$.each(rifff.data.banks[bank_key].bank_options, function(bank_option_key, bank_option_val){
				
				var overplay = $(".bank_option_container[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_key+"'] .overplay").is(':checked');
				console.log("overplay! '"+bank_key+"'][data-bank-option='"+bank_option_key+"' -->" + overplay);
				if(!overplay) {
					soundManager.stop("sound_"+bank_key + '_'+bank_option_key);
				}
			});	
				
		}	
	});
}

rifff.stop = function(){ 
	worker.postMessage({'action':'stop'});
	soundManager.stopAll();
}
