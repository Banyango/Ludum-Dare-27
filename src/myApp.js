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

var Helloworld = cc.Layer.extend({

    player:null,
    tileMap:null,
    camera:null,
    timeStep:(1.0/60.0),
    delta:0,
    secondCounter:null,
    font:null,
    init:function () {

        this._super();

        this.camera = new Camera();

        this.camera.hold = false;

        this.camera.isPlatformLockCamera = false;

        this.setKeyboardEnabled(true);

        cc.SpriteFrameCache.getInstance().addSpriteFrames("/res/player_spritesheet.plist");
        var spriteSheet = cc.SpriteBatchNode.create("/res/player_spritesheet.png", 1);
        this.addChild(spriteSheet);

        var tmxFile = "/res/level1.tmx";

        this.tileMap = cc.TMXTiledMap.create(tmxFile);

//        this.font = cc.BMFontConfiguration.create("/res/2plyrFont2PlyrFont.fnt");
//
//        this.font.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height - 50);
//
//        this.addChild(this.font);

        var mapXML = cc.SAXParser.getInstance().tmxParse(tmxFile);

        this.player = new PlatformPlayer();
        this.player.init();
        this.player.id = Math.random();
        this.player.desiredPosition = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);
        this.player.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);

        this.tileMap.addChild(this.player.sprite);

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
                this.player.lastSpawnBeacon = cc.p(obj.x, obj.y);
            }
        }

        this.scheduleUpdate();

        this.schedule(function () {

            if (this.secondCounter <= 0) {
                this.secondCounter = 10;

                this.blowUp();
            }

            this.secondCounter--;
        }, 1);

        return true;
    },
    blowUp:function(){
        this.player.position = this.player.lastSpawnBeacon;
        if (this.player.nextDirection != null) {
            this.player.direction = this.player.nextDirection;
        }
        this.camera.updateHard(this.tileMap, this.player.position);
    },
    setViewPointCenter:function () {
        this.camera.update(this.tileMap, this.player);
    },
    update:function (delta) {

        this.delta+=delta;

        if (this.delta >= this.timeStep) {
            this.player.update(delta, this.camera);

            this.player.testCollision(this.tileMap.getObjectGroup("collision"), this.camera);

            this.player.testBeacon(this.tileMap.getObjectGroup("Beacon"), this.camera);

            this.setViewPointCenter();
        }

    },
    onKeyDown:function (e) {
        Keys[e] = true;
    },
    onKeyUp:function (e) {
        Keys[e] = false;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Helloworld();
        layer.init();
        this.addChild(layer);
    }
});
