var pejs = require('pejs');
var root = require('root');
var less = require('connect-lesscss');
var rex = require('rex');

var app = root();
var template = pejs();

app.use(root.json);
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

app.get('/', function(req, res) {
	res.render('app/index.html');
});

app.listen(8080);