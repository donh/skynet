var fs = require('fs');
var request = require("request");
var express = require('express');
var app = express();

// define a port we want to listen to
const PORT = 80;
var config = fs.readFileSync(__dirname + '/cfg.json', 'utf-8');
var api = JSON.parse(config).api;
var url = JSON.parse(config).url;

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));

app.get('/js/app_react.js', function(req, resp) {
	var appjs = fs.readFileSync(__dirname + '/js/app_react.js', 'utf-8');
	resp.writeHead(200, {
		'Content-Type': 'text/json',
		'Access-Control-Allow-Origin': null
	});
	resp.write(appjs);
	resp.end();
});

app.get('/alive', function(req, resp) {
	request({
		uri: api,
		method: "GET",
	}, function(error, response, body) {
		resp.writeHead(200, {
			'Content-Type': 'text/json',
			'Access-Control-Allow-Origin': null
		});
		resp.write(body);
		resp.end();
	});
});

app.get('/getUrl', function(req, resp) {
	resp.writeHead(200, {
		'Content-Type': 'text/json',
		'Access-Control-Allow-Origin': null
	});
	resp.write(JSON.stringify(url));
	resp.end();
});

app.get('/getJsonFile', function(req, resp) {
	fs.readFile(__dirname + '/data/OWL440_platforms.json', 'utf-8', function(err, data) {
		if (err) {
			console.log(err);
		} else {
			resp.writeHead(200, {
				'Content-Type': 'text/json',
				'Access-Control-Allow-Origin': null
			});
			resp.write(data);
			resp.end();
		}
	});
});

app.get('/readme', function(req, resp) {
	var readme = fs.readFileSync(__dirname + '/README.md', 'utf-8');
	resp.writeHead(200, {
		'Content-Type': 'text/json',
		'Access-Control-Allow-Origin': null
	});
	resp.write(readme);
	resp.end();
});

app.get('/', function(req, resp) {
	var html = fs.readFileSync(__dirname + '/react/index.html', 'utf-8');
	resp.writeHead(200, {
		'Content-Type': 'text/html'
	});
	resp.write(html);
	resp.end();
});

app.get('/angular', function(req, resp) {
	var html = fs.readFileSync(__dirname + '/angular/index.html', 'utf-8');
	resp.writeHead(200, {
		'Content-Type': 'text/html'
	});
	resp.write(html);
	resp.end();
});

app.get('/react', function(req, resp) {
	var html = fs.readFileSync(__dirname + '/react/index.html', 'utf-8');
	resp.writeHead(200, {
		'Content-Type': 'text/html'
	});
	resp.write(html);
	resp.end();
});

app.listen(PORT);
console.log("Server listening on: http://localhost:%s", PORT);
