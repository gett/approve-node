var pejs = require('pejs');
var root = require('root');
var rex = require('rex');
var common = require('common');
var db = require('mongojs').connect('approve:qweqwe@staff.mongohq.com:10075/approve-node', ['users']);
var request = require('request');
var qs = require('querystring');
var fs = require('fs');
var crypto = require('crypto');
var marked = require('marked');
var less = require('less');

var app = root();
var template = pejs();

var GITHUB_ID = 'e411408f92365f7bbf0a';
var GITHUB_SECRET = '6795299bd3f3c24e7af6275f4483cd11e892c152';
var SECRET = 'slfjasfo87234ifgkj';

app.use(root.json);
app.use(root.query);
app.use('/index.css', function(req, res, next) {
	var parser = new(less.Parser);

	fs.readFile('./app/index.css', 'utf-8', function(err, data) {
		if (err) return next(err);

		parser.parse(data, function(err, tree) {
			if (err) return next(err);

			try {
				data = tree.toCSS();				
			} catch (err) {
				return next(new Error('Line '+err.line+': '+err.message));
			}

			res.setHeader('content-type', 'text/css');
			res.setHeader('content-length', Buffer.byteLength(data));
			res.end(data);
		});
	});
});
app.use('/index.js', rex('./app/index.js', {
	dependencies: {
		jQuery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'
	}
}));

app.getter('request.id', function() {
	if (this._id) {
		return this._id;
	}

	var cookie = this.headers.cookie;

	cookie = cookie && (cookie.split('id=')[1] || '').split(';')[0];

	if (!cookie) {
		return null;
	}

	var id = cookie.split('.')[0];
	var date = cookie.split('.')[1];
	var signature = cookie.split('.')[2];

	if (crypto.createHmac('sha256', SECRET).update(id+'.'+date).digest('hex') !== signature) {
		return null;
	}

	this._id = parseInt(id, 10);
	return this._id;
});

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
app.fn('response.redirect', function(url) {
	this.statusCode = 307;

	if (url.charAt(0) === '/') {
		url = 'http://'+this.request.headers.host+url;
	}

	this.setHeader('location', url);
	this.end();
});

app.get('/', function(req, res, onerror) {
	if (!req.id) {
		res.render('app/index.html');
		return;
	}

	common.step([
		function(next) {
			db.users.findOne({id:req.id}, next);
		},
		function(user) {
			res.render('app/home.html', user);
		}
	], onerror);
});

app.get('/modules/{name}', function(req, res, onerror) {
	common.step([
		function(next) {
			request('http://search.npmjs.org/api/'+req.params.name, {
				json: true
			}, next);
		},
		function(response) {
			if (response.statusCode !== 200) {
				res.send(response.statusCode, 'Module could not be loaded');
				return;
			}

			var mod = response.body;
			var readme = mod.readme || mod.versions[mod['dist-tags'].latest].readme;

			if (!readme) {
				res.send(mod);
				return;
			}

			res.render('app/module.html', {readme:marked(readme)});
		}
	], onerror);
});

app.get('/signout', function(req, res) {
	res.setHeader('set-cookie', 'id=0; expires Thu, 01 Jan 1970 00:00:00 GMT');
	res.redirect('/');
});

app.get('/authorized', function(req, res, onerror) {
	var code = req.query.code;
	var cookie;

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

			request.get('https://api.github.com/user', {
				qs: {
					access_token: qs.parse(response.body).access_token
				},
				json: true
			}, next);
		},
		function(response, next) {
			if (response.statusCode !== 200) {
				res.send(response.statusCode, 'Error fetching user data');
				return;
			}

			var user = response.body;

			cookie = user.id+'.'+Date.now();
			cookie += '.'+crypto.createHmac('sha256', SECRET).update(cookie).digest('hex');

			db.users.update({id:user.id}, {$set:user}, {upsert:true}, next);
		},
		function() {
			res.setHeader('set-cookie', 'id='+cookie+'; expires='+new Date(Date.now() + 14*24*60*60*1000).toUTCString());
			res.redirect('/');
		}
	], onerror);
});

app.listen(8080);