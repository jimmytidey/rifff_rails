
audio.sounds = [];

function loadSound(url, bank_number, bank_option_number) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	
	if (typeof audio.audioBuffers[bank_number] === "undefined") { 
		audio.audioBuffers[bank_number] = [];
		audio.sounds[bank_number] = [];
	}
	
	if (typeof rifff.audioBuffers[bank_number][bank_option_number] === "undefined") { 
		audio.audioBuffers[bank_number][bank_option_number] = [];
		audio.sounds[bank_number][bank_option_number] = [];
	}
	
	// Decode asynchronously
	request.onload = function() {
		context.decodeAudioData(request.response, function(buffer) {
			audio.audioBuffers[bank_number][bank_option_number] = buffer;
			$('#test').append('loaded:' + bank_number + "--" + bank_option_number + "<br />");
		});
	}
	request.send();
}
