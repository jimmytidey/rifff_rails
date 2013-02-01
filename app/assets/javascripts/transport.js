console.log("TRANSPORT PAGE");

rifff.current_step = 0;

rifff.updatePlayhead = function() { 
	
	var playhead_offset; 
	
	if (rifff.mode == 'edit') { 
		playhead_offset = 303;
	}
	
	else { 
		playhead_offset = 5; 
	}
	var left =  (rifff.current_step * 17) + playhead_offset;
	$('#playhead').css('left', left);
}

$(document).ready(function(){	
	$('#forward').click(function(){
		if (rifff.current_step < rifff.data.project_info.steps-1) {
			rifff.current_step ++;
			rifff.updatePlayhead();
		}
	});

	$('#backwards').click(function(){
		if (rifff.current_step > 0) {
			rifff.current_step--;
			rifff.updatePlayhead();	
		}		
	});
	
	$('#rewind').click(function(){
		rifff.current_step = 0;
		rifff.updatePlayhead();		
	});
	
});