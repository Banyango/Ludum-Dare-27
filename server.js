var express = require('express'),
    server = express();

server.use('/cocos2d', express.static(__dirname + '/cocos2d') );
server.use('/CocosDenshion', express.static(__dirname + '/CocosDenshion') );
server.use('/src', express.static(__dirname + '/src') );
server.use('/res', express.static(__dirname + '/res') );

server.get('/main.js', function(req,res){
    res.sendfile(__dirname + '/src/main.js');
});

server.get('/', function(req,res){
    res.sendfile('index.html');
});

var port = process.env.PORT || 2000;
server.listen(port);

