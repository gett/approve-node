var request = require('browser-request');
var name = $('script').data('name');

$('.approve').on('click', function() {
	request.post({
		url: '/approves/'+name,
		json: true
	}, function(err, response) {
		console.log('her nu...')
	});
});
