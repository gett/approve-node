$(function() {

	$('.search').on('keydown', function(e) {
		if (e.keyCode !== 13) return;

		window.location = '/search/'+$(this).val();	
	});

});