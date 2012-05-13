require('./widgets/search')();

$('.help-us').on('click', '.read-more', function() {
	$(this).text('Read less').removeClass('read-more').addClass('read-less');
	$('.more-info').slideDown();
});
$('.help-us').on('click', '.read-less', function() {
	$(this).text('Read more').removeClass('read-less').addClass('read-more');
	$('.more-info').slideUp();
});
