rifff.play_helper = function() {	
	var elem = $('#play');
	if(rifff.play_status !== 'playing') { 
		elem.text('stop');
		elem.removeClass('btn-success');
		elem.addClass('btn-danger');
		rifff.play();
	}
	else { 
		elem.text('play');
		elem.removeClass('btn-danger');
		elem.addClass('btn-success');
		rifff.stop();
	}
}

$(window).scroll(function () {
	if ($(window).scrollTop() > 200) {
		$('#controls').css('position','fixed');
		$('#controls').css('margin-top','-190px');
	}else { 
		$('#controls').css('position','static');
		$('#controls').css('margin-top','auto');
	}
});