var root = require('root');
var app = root();

var hogan = require('hogan.js');
var fs = require('fs');

app.use(root.json);
app.fn('response.render', function(filename, options) {
	var self = this;

	fs.readFile(filename, 'utf-8', function(err, data) {
		if (err) return self.next(err.code !== 'ENOENT' && err);
		self.end(data);
	});
});

app.get('/', function(req, res) {
	res.render('app/index.html');
});

app.listen(8080);