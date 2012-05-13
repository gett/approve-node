$(function() {
	var LATIN = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').map(function(ch) {
		return ch.charCodeAt(0);
	});

	$('.search').on('keydown', function(e) {
		if (e.keyCode !== 13) return;

		window.location = '/search/'+$(this).val();	
	});

	$(document).on('keydown', function(e) {
		if (LATIN.indexOf(e.keyCode) < 0) return;

		$('.search').focus();
	});
});