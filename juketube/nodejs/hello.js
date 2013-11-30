var http = require('http');
var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(4000);
var io = require('socket.io').listen(server);
console.log('Server running at http://127.0.0.1:1337/');
