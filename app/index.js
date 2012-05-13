$(function() {
	var LATIN = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').map(function(ch) {
		return ch.charCodeAt(0);
	});

	$(document).on('keydown', function(e) {
		if (LATIN.indexOf(e.keyCode) < 0) return;

		$('.search').focus();
	});
	
	$('.search').on('keydown', function(e) {
		if (e.keyCode !== 13) return;

		window.location = '/search/'+$(this).val();	
	});
	$('.help-us').on('click', '.read-more', function() {
		$(this).text('Read less').removeClass('read-more').addClass('read-less');
		$('.more-info').slideDown();
	});
	$('.help-us').on('click', '.read-less', function() {
		$(this).text('Read more').removeClass('read-less').addClass('read-more');
		$('.more-info').slideUp();
	});
});