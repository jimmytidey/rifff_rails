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
	  url: '/	assets/swf/soundmanager2.swf'
	});
	soundManager.onready(function() {
		rifff.loadSounds();

	});
});


rifff.loadSounds = function() { 
	console.log('--');
	console.log(rifff.file_list);
	$.each(rifff.file_list, function(key, file){
		rifff.loadSound(file.location, key)
	});
}

rifff.loadSound =function(location, key) {
	console.log('loading!!!');
	soundManager.createSound({
		id: "sound_"+key,
		url: location,
		autoLoad: true,
		autoPlay: false,
		onload: function() {
			console.log('hi');
		},
		whileloading: function(){
			console.log('loading...');
		},
		volume: 50
	});
	
	soundManager.play(key,{volume:50});
}

rifff.play = function(){ 
	worker.postMessage({'action':'play', 'data': rifff.loop_trigger_interval});
	//rifff.loop_trigger_interval
	worker.onmessage = function(event){
		rifff.playStep();
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
			var source = context.createBufferSource(); // creates a sound source
			
			//look and get whatever sound is selected for this source
			var buffer_id = $(".file_select[data-bank='"+bank_key+"'][data-bank-option='"+bank_value+"']").find('option:selected').attr('data-id');
			source.buffer = rifff.buffers[buffer_id];	
			source.connect(context.destination);       // connect the source to the context's destination (the speakers)
			rifff.players.push(source);
			source.noteOn(0);
		}	
	});
}

rifff.stop = function(){ 
	worker.postMessage({'action':'stop'});
	$.each(rifff.players, function(key,val){
		val.noteOff(0);
	});
	
}
