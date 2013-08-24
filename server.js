var express = require('express'),
    server = express();

server.use('/cocos2d', express.static(__dirname + '/cocos2d'));
server.use('/CocosDenshion', express.static(__dirname + '/CocosDenshion'));
server.use('/src', express.static(__dirname + '/src'));
server.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/lib/'));

server.use('/res', express.static(__dirname + '/res'));

server.get('/main.js', function (req, res) {
    res.sendfile(__dirname + '/src/main.js');
});

server.get('/', function (req, res) {
    res.sendfile('index.html');
    console.log('Sent index.html');
});

server.get('/api/hello', function(req,res){
    res.send('Hello World');
});

var port = process.env.PORT || 2000;
server.listen(port);

console.log('process started on port = %d', port);