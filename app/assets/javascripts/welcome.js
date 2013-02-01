$(document).ready(function(){ 
	
	$('.btnlink').click(function(){ 
	  window.location = $(this).attr('data-href');
	});
});