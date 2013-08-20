var port = process.env.PORT || 5000,
    express = require('express'),
    server = express(),
    io = require('socket.io'),
    mongoose = require('mongoose'),
    immediately = process.nextTick,
    Player = require('./Player').Player;

var uristring =
    process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        'mogodb://localhost/LudumDare27';

var theport = process.env.PORT || 5000;

var sockets, players;

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
});

mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
    }
});

var userSchema = new mongoose.Schema({
    id:{type:String},
    x:{type:Number},
    y:{type:Number}
});

var UserDB = mongoose.model('Users', userSchema);

var serv_io = io.listen(server.listen(port));
console.log("Listening on port " + port);

players = [];

serv_io.set('log level', 1);

serv_io.configure(function () {
    serv_io.set("transports", ["xhr-polling"]);
    serv_io.set("polling duration", 10);
});

serv_io.sockets.on('connection', function (client) {
    console.log("New player has connected: " + client.id);

//    UserDB.find({}, function (err, users){
//        client.emit("get history", users);
//    });

    client.on("new player", onNewPlayer);

    client.on("move player", function (data) {
        var player = playerById(data.id);

        if (!player) {
            console.log("Player not found " + data.id);
            return;
        }

        player.setX(data.x);
        player.setY(data.y);

        client.broadcast.emit("move player", {id:player.id, x:player.getX(), y:player.getY()})
    });

    client.on("save location", function (data) {
//        var blit = new UserDB({
//            id:data.id,
//            x:data.x,
//            y:data.y
//        });
//
//        blit.save(function (err) {
//            if (err)
//                console.log('Error on save!');
//            else
//                console.log('saved! x=' + data.x + ' y= ' + data.y);
//        });
    });

    function onNewPlayer(data) {
        console.log("Creating new player: " + data.id);

        var newPlayer = new Player(data.x, data.y);
        newPlayer.id = data.id;
        client.broadcast.emit("new player", {id:newPlayer.id, x:newPlayer.getX(), y:newPlayer.getY()});

        var i, existingPlayer;
        for (i = 0; i < players.length; i++) {
            existingPlayer = players[i];
            client.emit("new player", {id:existingPlayer.id, x:existingPlayer.getX(), y:existingPlayer.getY()});
        }

        players.push(newPlayer);
    }

    function playerById(id) {
        for (var i = 0; i < players.length; i++) {
            var obj = players[i];
            if (obj.id == id) {
                return obj;
            }
        }
        return null;
    }


});


serv_io.sockets.on("disconnect", function () {
    console.log("Player has disconnected " + this.id);
});


