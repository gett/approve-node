var pejs = require('pejs');
var root = require('root');
var less = require('connect-lesscss');
var rex = require('rex');
var request = require('request');
var common = require('common');
var qs = require('querystring');

var app = root();
var template = pejs();

var GITHUB_ID = 'e411408f92365f7bbf0a';
var GITHUB_SECRET = '6795299bd3f3c24e7af6275f4483cd11e892c152';

app.use(root.json);
app.use(root.query);
app.use('/index.css', less('./app/index.css'));
app.use('/index.js', rex('./app/index.js', {
	dependencies: {
		jQuery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'
	}
}));

app.fn('response.render', function(filename, options) {
	var self = this;

	template.render(filename, options, function(err, data) {
		if (err) return self.next(err.code !== 'ENOENT' && err);
		self.end(data);
	});
});
app.fn('response.send', function(statusCode, message) {
	if (!message && typeof statusCode !== 'number') {
		message = statusCode;
		statusCode = 200;
	}

	if (typeof message === 'object') {
		this.json(statusCode, message);
		return;
	}

	message = message || '';

	this.statusCode = statusCode;
	this.setHeader('content-type', /2\d\d/.test(statusCode) ? 'text/html' : 'text/plain');
	this.setHeader('content-length', Buffer.byteLength(message));
	this.end(message);
});

app.get('/', function(req, res) {
	res.render('app/index.html');
});

app.get('/authorized', function(req, res, onerror) {
	var code = req.query.code;

	if (!code) {
		res.send(400, 'Need token');
		return;
	}

	common.step([
		function(next) {
			request.post('https://github.com/login/oauth/access_token', {
				qs: {
					client_id: GITHUB_ID,
					client_secret: GITHUB_SECRET,
					code: code
				}
			}, next);
		},
		function(response, next) {
			if (response.statusCode !== 200) {
				res.send(response.statusCode, 'Did not auth with Github');
				return;
			}

			request.post('https://api.github.com/user', {
				qs: {
					access_token: qs.parse(response.body).access_token
				},
				json: true
			}, next);
		},
		function(response) {
			console.log(response.body);
			res.send(response.body);
		}
	], onerror);
});

app.listen(8080);