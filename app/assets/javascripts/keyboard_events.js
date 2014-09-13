rifff.attachKeyboardEvents = function(){ 
	$('body').keyup(function(e){
		if(e.keyCode == 82){
			$('#randomise').addClass('active');
			setTimeout(function(){ 
				$('#randomise').removeClass('active');
			}, 200)
			rifff.writeScore();
		}
		if(e.keyCode == 32){
			rifff.play_helper();
		}


	});

	$('body').keydown(function(e){
		if(e.keyCode == 32){
			return false; 
		}
	});


}
