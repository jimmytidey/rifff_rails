rifff.current_step = 0;

rifff.updatePlayhead = function() { 
	var left =  (rifff.current_step * 17) + 379;
	$('#playhead').css('left', left);
}

$(document).ready(function(){	
	$('#forward').click(function(){
		if (rifff.current_step < rifff.number_of_steps-1) {
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