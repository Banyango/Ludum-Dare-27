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
    secondCounter:10,
    font:null,
    spores:[],
    init:function () {

        this._super();

        this.camera = new Camera();

        this.camera.hold = false;

        this.camera.isPlatformLockCamera = false;

        this.setKeyboardEnabled(true);

        cc.SpriteFrameCache.getInstance().addSpriteFrames("/res/player_spritesheet.plist");
        var playerSpriteSheet = cc.SpriteBatchNode.create("/res/player_spritesheet.png", 1);
        this.addChild(playerSpriteSheet);

        cc.SpriteFrameCache.getInstance().addSpriteFrames("/res/spore.plist");
        var sporeSpriteSheet = cc.SpriteBatchNode.create("/res/spore.png", 1);
        this.addChild(sporeSpriteSheet);

        var tmxFile = "/res/level1.tmx";

        this.tileMap = cc.TMXTiledMap.create(tmxFile);

        this.font = cc.LabelTTF.create('label text',  'Press Start 2P', 32, cc.size(32,16), cc.TEXT_ALIGNMENT_LEFT);

        this.font.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height - 50);

        this.addChild(this.font);

        var mapXML = cc.SAXParser.getInstance().tmxParse(tmxFile);

        var parallaxNode = cc.ParallaxNode.create();

        var background = new cc.Sprite();
        background.initWithFile("/res/ludum_dare_background.png");
        background.setPosition(cc.p(400, 500));
        background.setScaleX(8);
        background.setScaleY(8);
        background.getTexture().setAliasTexParameters();

        parallaxNode.addChild(background, 1, cc.p(0.02,0.02), cc.p(512,256));
        this.addChild(parallaxNode, 0);

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

        objectGroup = this.tileMap.getObjectGroup("Beacon");

        for (var i = 0; i < objectGroup.getObjects().length; i++) {

            var obj = objectGroup.getObjects()[i];

            var spore = new Spore();

            spore.initialize();
            spore.collisionBox = cc.RectMake(obj.x, obj.y, obj.width, obj.height);
            spore.position = cc.p(obj.x, obj.y);
            spore.direction = obj.type;

            this.tileMap.addChild(spore.sprite);

            this.spores.push(spore);
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
    moveCameraToLastBeacon:function(){
        var rect = this.player.lastSpawnBeacon.collisionBox;
        var position = cc.p(rect.origin.x + rect.size.width / 2, rect.origin.y + rect.size.height / 2);

        this.camera.updateHard(this.tileMap, position);
    },
    respawnPlayer:function() {
        this.tileMap.addChild(this.player.sprite);
        this.player.position = cc.p(this.player.lastSpawnBeacon.position.x + this.player.lastSpawnBeacon.getBoundingBox().size.width / 2, this.player.lastSpawnBeacon.position.y + this.player.lastSpawnBeacon.getBoundingBox().size.height / 2);
        this.player.spawnJump();
        if (this.player.nextDirection != null) {
            this.player.direction = this.player.nextDirection;
        }
        this.player.isDead = false;
    },
    animateSpawnBeacon:function() {
        this.player.lastSpawnBeacon.sprite.stopAllActions();
        var animate = cc.Animate.create(this.player.lastSpawnBeacon.spawnAnimation);
        this.player.lastSpawnBeacon.sprite.runAction(animate);
    },
    blowUp:function(){
        if (this.player.lastSpawnBeacon != null && this.player.lastSpawnBeacon instanceof Spore ) {
            this.player.kill();

            var particle = cc.ParticleSystemQuad.create("/res/player_die_particle.plist");
            particle.setPosition(cc.p(this.player.position.x + this.player.getBoundingBox().size.width / 2, this.player.position.y + this.player.getBoundingBox().size.height / 2));

            this.tileMap.addChild(particle);

            var delay = cc.DelayTime.create(1);
            var moveCamera = cc.CallFunc.create(this.moveCameraToLastBeacon, this, null);
            var delay2 = cc.DelayTime.create(0.1);
            var animate = cc.CallFunc.create(this.animateSpawnBeacon, this, null);
            var delay3 = cc.DelayTime.create(0.4);
            var respawnPlayer = cc.CallFunc.create(this.respawnPlayer, this, null);

            var sequence = cc.Sequence.create([delay, moveCamera, delay2, animate, delay3, respawnPlayer]);

            this.runAction(sequence);
        }
    },
    setViewPointCenter:function () {
        this.camera.update(this.tileMap, this.player);
    },
    update:function (delta) {

        this.delta+=delta;

        if (this.delta >= this.timeStep) {
            this.player.update(delta, this.camera);

            this.player.testCollision(this.tileMap.getObjectGroup("collision"), this.camera);

            this.player.testBeacon(this.spores, this.camera);

            for (var i = 0; i < this.spores.length; i++) {
                var obj = this.spores[i];
                obj.update(delta)
            }

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
