//MOVE THE PLAYHEAD AROUND 
rifff.current_step = 0;

rifff.updatePlayhead = function() { 
	
	var playhead_offset; 
	
	if (rifff.mode == 'edit') { 
		playhead_offset = 293;
	}
	
	else { 
		playhead_offset = 5; 
	}
	var left =  (rifff.current_step * 17) + playhead_offset;
	$('#playhead').css('left', left);
}

