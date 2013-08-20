/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var Keys = {};
var spawner = [];
var remotePlayers = [];
var history = [];

var Helloworld = cc.Layer.extend({

    player:null,
    tileMap:null,
    camera:null,
    rayCaster:null,
    socket:null,
    ghost:null,
    shouldUpdatePosition:null,
    onSocketConnect:function () {
        console.log("Connected to socket server");
    },
    onSocketDisconnect:function () {
        console.log("Disconnected from socket server");
    },
    onNewPlayer:function (data) {
        console.log("New player connected: " + data.id);

        var player = new Remote();
        player = player.init();
        player.id = data.id;
        remotePlayers.push(player);

        spawner.push(player);
    },
    onMovePlayer:function (data) {
        var player = findPlayerById(data.id);

        if (player) {
            player.position = cc.p(data.x, data.y);
        }
    },
    onRemovePlayer:function (data) {
        if (data == null) {
            console.log("data undefined");
            return;
        }

        var player = findPlayerById(data.id);
        if (player) {
            remotePlayers.pop(player);
        }
    },
    requestHistory:function(data){
        if (data != null) {
            history = data;
        }
    },
    init:function () {

        this._super();

        this.socket = io.connect("http://localhost:5000");

        remotePlayers = [];

        this.socket.on("connect", this.onSocketConnect);
        this.socket.on("disconnect", this.onSocketDisconnect);
        this.socket.on("new player", this.onNewPlayer);
        this.socket.on("move player", this.onMovePlayer);
        this.socket.on("remove player", this.onRemovePlayer);
        this.socket.on("get history", this.requestHistory);

        this.camera = new Camera();

        this.camera.hold = false;

        this.camera.isPlatformLockCamera = false;

        this.setKeyboardEnabled(true);

        cc.SpriteFrameCache.getInstance().addSpriteFrames("/res/player_spritesheet.plist");
        var spriteSheet = cc.SpriteBatchNode.create("/res/player_spritesheet.png", 1);
        this.addChild(spriteSheet);

        var tmxFile = "/res/level1.tmx";

        this.tileMap = cc.TMXTiledMap.create(tmxFile);

        var mapXML = cc.SAXParser.getInstance().tmxParse(tmxFile);

        this.player = new TopDownPlayer();
        this.player.init();
        this.player.id = Math.random();
        this.player.desiredPosition = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);
        this.player.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);

        this.tileMap.addChild(this.player.sprite);

        this.socket.emit("new player", {id:this.player.id, x:this.player.getPosition().x, y:this.player.getPosition().y});

        this.tileMap.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);

        this.addChild(this.tileMap);

        var objectGroup = this.tileMap.getObjectGroup("static");

        for (var i = 0; i < objectGroup.getObjects().length; i++) {

            var obj = objectGroup.getObjects()[i];

            if (obj.type == "player_start") {
                this.player.position = cc.p(obj.x, obj.y);
                this.tileMap.stopActionByTag(7);
                this.tileMap.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);
                this.camera.updateHard(this.tileMap, cc.p(obj.x, obj.y));
            }
        }

        this.scheduleUpdate();

        this.ghost = new Ghost();

        this.schedule(function(){
            this.socket.emit("save location", {id:this.player.id, x:this.player.position.x, y:this.player.position.y});
        });

        this.socket.emit("request history");

        return true;
    },
    setViewPointCenter:function () {
        this.camera.update(this.tileMap, this.player);
    },
    update:function (delta) {
        this.player.update(delta, this.socket);

        this.setViewPointCenter();

        this.player.testCollision(this.tileMap.getObjectGroup("collision"), this.camera);

        this.socket.emit("move player", {id:this.player.id, x:this.player.position.x, y:this.player.position.y});

        if (spawner.length > 0) {
            for (var i = 0; i < spawner.length; i++) {
                var obj = spawner[i];
                var layer = new cc.Layer();
                this.tileMap.addChild(obj.sprite);
            }
            spawner = [];
        }

        for (var i = 0; i < remotePlayers.length; i++) {
            var obj1 = remotePlayers[i];
            obj1.update(delta);
        }

        if (history != null) {
            var history = history.pop();

            this.ghost.position = cc.p(history.x, history.y);
        }

    },
    onKeyDown:function (e) {
        Keys[e] = true;
    },
    onKeyUp:function (e) {
        Keys[e] = false;
        this.shouldUpdatePosition = true;
    }
});

function findPlayerById(id) {
    for (var i = 0; i < remotePlayers.length; i++) {
        var obj = remotePlayers[i];
        if (obj.id == id) {
            return obj;
        }
    }
    return null;
}

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Helloworld();
        layer.init();
        this.addChild(layer);
    }
});
