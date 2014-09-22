rifff.previewAudioNodes= []; //place to store these specially created audio nodes


rifff.playSoundById= function(id){
    rifff.previewAudioNodes[id] = context.createBufferSource();
    rifff.previewAudioNodes[id].buffer = rifff.audioBuffers[id];
    rifff.previewAudioNodes[id].connect(context.destination); 

    if(i_am_very_old) {
        rifff.previewAudioNodes[id].noteOn(0, 0, 1000);
    } 
    else {
        rifff.previewAudioNodes[id].start(0, 0, 1000);

    }
}

rifff.stopSoundById= function(id){
	rifff.stopNode(rifff.previewAudioNodes[id]);
}

rifff.attachPreviewClickEvents =  function(){
	$('.preview_btn').unbind('click');
	$('.preview_btn').click(function(){
		var elem = $(this);
		var sound_id = parseInt(elem.attr('data-sound-id'));
		
		if(elem.hasClass('icon-volume-up')){	
			rifff.playSoundById(sound_id);
			$(this).removeClass('icon-volume-up');
			$(this).addClass('icon-stop');
		} 
		else { 
			rifff.stopSoundById(sound_id);
			$(this).removeClass('icon-stop');
			$(this).addClass('icon-volume-up');
		}

	});
};