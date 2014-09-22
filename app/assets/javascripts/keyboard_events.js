rifff.attachKeyboardEvents = function(){ 
	
	$('body').keyup(function(e){
		if(e.keyCode === 82){
			$('#randomise').addClass('active');
			setTimeout(function(){ 
				$('#randomise').removeClass('active');
			}, 200)
			rifff.writeScore();
		}
		if(e.keyCode === 32){
			console.log('triggered');
			rifff.play_helper();
		}
		
		if(e.keyCode === 37) { 
			rifff.backward();
		}

		if(e.keyCode === 39) { 
			rifff.forward();
		}


	});

	$('body').keydown(function(e){
		if(e.keyCode == 32){
			console.log('also triggered');
			return false; 
		}

		if(e.keyCode == 37) { 
			return false; 
		}

		if(e.keyCode == 39) { 
			return false; 
		}
	});


}
