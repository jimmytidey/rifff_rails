rifff = {};
rifff.buffers = [];
rifff.players = [];


var context = new webkitAudioContext();
var worker = new Worker('/assets/worker.js');

$(document).ready(function(){ 
	$('#play').click(function(){
		rifff.play();
	});
	
	$('#stop').click(function(){
		rifff.stop();
	});
	
	soundManager.setup({
		url: '/	assets/swf/soundmanager2.swf',
		'useHTML5Audio': true
	});
	soundManager.onready(function() {
		rifff.loadSounds();
	});
});


rifff.loadSounds = function() { 
	$.each(rifff.file_list, function(key, file){
		rifff.loadSound(file.location, key)
	});
}

rifff.loadSound =function(location, key) {

	
	soundManager.createSound({
		id: "sound_"+key,
		url: location,
		autoLoad: true,
		autoPlay: false,
		onload: function() {
			$('.audio_file[data-id='+key+'] .load_indicator').css('background-color','green');
			$('.audio_file[data-id='+key+'] .load_indicator').attr('data-loaded','1');
			
			//test to see all items are loaded
			if ($(".load_indicator[data-loaded='1']").length == $(".load_indicator").length) {
			    rifff.buildSoundMatrix();
			}
		},
		whileloading: function(){
			var percent_loaded = this.bytesLoaded / this.bytesTotal * 100; 
			$('.audio_file[data-id='+key+'] .load_indicator').html(percent_loaded + "%");
		},
		volume: 50
	});	
}

rifff.buildSoundMatrix = function(){ 
	$.each(rifff.data.banks, function(bank_key, bank_val){
		rifff.players[bank_key] = [];
		$.each(bank_val.bank_options, function(bank_option_key, bank_option_val){
			var sound_id = $(".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_key+"']").find('[selected]').attr('data-id');
			console.log('sound_id' + sound_id );
			if(typeof sound_id != 'undefined' ) {
				rifff.players[bank_key][bank_option_key] = soundManager.play('sound_'+sound_id);
				rifff.players[bank_key][bank_option_key].stop();
			
				$(".dial[data-bank='"+bank_key+"'][data-bank-option='"+bank_option_key+"']").parent().mouseup(function(){
					var volume = parseInt($(".dial",this).val());
					rifff.players[bank_key][bank_option_key].setVolume(volume);
					rifff.saveJson();
					rifff.data.banks[bank_key].bank_options[bank_option_key].volume = volume;
				});
			}	
			
		});
	});
}


rifff.play = function(){ 
	worker.postMessage({'action':'play', 'data': rifff.loop_trigger_interval});
	rifff.loop_trigger_interval
	worker.onmessage = function(event){
		rifff.playStep();
		console.log("worker:" + event.data);
		if(event.data) {
			rifff.current_step++;
			rifff.updatePlayhead();
		}	
	};
}

rifff.playStep = function(){ 
	var play_array = rifff.score[rifff.current_step];
	
	$.each(play_array, function(bank_key,bank_value){
		if(bank_value !== '-') {
			//look and get whatever sound is selected for this source
			var buffer_id = $(".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_value+"']").find('option:selected').attr('data-id');
			rifff.players[bank_key][bank_value].play(this, {onfinish: function(){alert('hi');}});
			
			
		
		}	
	});
}

rifff.stop = function(){ 
	worker.postMessage({'action':'stop'});
	soundManager.stopAll();
	
}
