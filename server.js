var pejs = require('pejs');
var root = require('root');
var less = require('connect-lesscss');

var app = root();
var template = pejs();

app.use(root.json);
app.use('/index.css', less('./app/index.css'));

app.fn('response.render', function(filename, options) {
	var self = this;

	template.render(filename, options, function(err, data) {
		if (err) return self.next(err.code !== 'ENOENT' && err);
		self.end(data);
	});
});

app.get('/', function(req, res) {
	res.render('app/index.html');
});

app.listen(8080);