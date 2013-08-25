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

var Keys = {},
    levelIndex = 1;

var keyColors = [
    new cc.Color3B(100,230,45), new cc.Color3B(12,14,45),
    new cc.Color3B(11,44,45), new cc.Color3B(255,230,45),
    new cc.Color3B(3,230,255), new cc.Color3B(100,230,45),
    new cc.Color3B(100,230,45), new cc.Color3B(100,230,45),
    new cc.Color3B(100,230,45), new cc.Color3B(100,230,45)];

var Helloworld = cc.Layer.extend({

    player:null,
    tileMap:null,
    camera:null,
    timeStep:(1.0 / 60.0),
    delta:0,
    secondCounter:10,
    font:null,
    spores:[],
    eaters:[],
    keys:[],
    doors:[],
    isResetting:false,
    egg:null,
    colourLayer:null,
    isPaused:false,
    pauseFont:null,
    pauseButtonTick:0,
    init:function (tmxFile) {

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

        cc.SpriteFrameCache.getInstance().addSpriteFrames("/res/egg_goal_spritesheet.plist");
        var eggSpriteSheet = cc.SpriteBatchNode.create("/res/egg_goal_spritesheet.png", 1);
        this.addChild(eggSpriteSheet);

        cc.SpriteFrameCache.getInstance().addSpriteFrames("/res/eater.plist");
        var eaterSpriteSheet = cc.SpriteBatchNode.create("/res/eater.png", 1);
        this.addChild(eaterSpriteSheet);

        this.tileMap = cc.TMXTiledMap.create(tmxFile);

        this.font = cc.LabelTTF.create('10', 'Press Start 2P', 32);

        this.font.position = cc.p(0,0);
        var scoreLayer = new cc.Layer();

        this.pauseFont = cc.LabelTTF.create('Paused', 'Press Start 2P', 50);
        this.pauseFont.setVisible(false);

        scoreLayer.addChild(this.font);
        scoreLayer.addChild(this.pauseFont);
        scoreLayer.setPosition(cc.p(cc.Director.getInstance().getWinSize().width/2, cc.Director.getInstance().getWinSize().height - 50));
        this.addChild(scoreLayer, 10);

        this.colourLayer = new cc.LayerColor();

        this.colourLayer.init(new cc.Color3B(255, 0, 0), cc.Director.getInstance().getWinSize().width, cc.Director.getInstance().getWinSize().height);
        this.colourLayer.setPosition(0,0);
        this.colourLayer.setOpacity(0);

        this.addChild(this.colourLayer, 12);

        var mapXML = cc.SAXParser.getInstance().tmxParse(tmxFile);

        var parallaxNode = cc.ParallaxNode.create();

        var background = new cc.Sprite();
        background.initWithFile("/res/ludum_dare_background.png");
        background.setPosition(cc.p(400, 500));
        background.setScaleX(8);
        background.setScaleY(8);
        background.getTexture().setAliasTexParameters();

        parallaxNode.addChild(background, 1, cc.p(0.02, 0.02), cc.p(512, 256));
        this.addChild(parallaxNode, 0);

        this.player = new PlatformPlayer();
        this.player.init();
        this.player.id = Math.random();
        this.player.desiredPosition = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);
        this.player.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);

        this.tileMap.addChild(this.player.sprite, 5);

        this.tileMap.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);

        this.addChild(this.tileMap);

        var objectGroup = this.tileMap.getObjectGroup("Static");

        this.keys = [];
        this.doors = [];

        for (var i = 0; i < objectGroup.getObjects().length; i++) {

            var obj = objectGroup.getObjects()[i];

            if (obj.type == "player_start") {
                this.player.position = cc.p(obj.x, obj.y);
                this.tileMap.stopActionByTag(7);
                this.tileMap.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);
                this.camera.updateHard(this.tileMap, cc.p(obj.x, obj.y));
                this.player.lastSpawnBeacon = cc.p(obj.x, obj.y);
            }

            if (obj.type == "goal_up" || obj.type == "goal_down") {
                this.egg = new Egg();
                this.egg.position = cc.p(obj.x, obj.y);
                this.egg.init();
                this.tileMap.addChild(this.egg.sprite, 4);
                this.egg.collisionBox = cc.RectMake(obj.x, obj.y, obj.width, obj.height);

                if (obj.type == "goal_down") {
                    this.egg.direction = "DOWN"
                } else {
                    this.egg.direction = "UP";
                }
            }

            if (obj.type.match("key_object") != null) {
                var key = new Key();
                key.init(obj);

                this.tileMap.addChild(key.sprite, 12);

                this.keys.push(key);
            }

        }

        this.spores = [];

        objectGroup = this.tileMap.getObjectGroup("Beacon");

        for (var k = 0; k < objectGroup.getObjects().length; k++) {

            var sporeObj = objectGroup.getObjects()[k];

            var spore = new Spore();

            spore.initialize();
            spore.collisionBox = cc.RectMake(sporeObj.x, sporeObj.y, sporeObj.width, sporeObj.height);
            spore.position = cc.p(sporeObj.x, sporeObj.y);
            spore.direction = sporeObj.type.replace("FIRE","").replace("WATER", "").replace("FLOAT","").trim();
            spore.sporeType = sporeObj.type.replace("UP","").replace("DOWN","").trim();

            this.tileMap.addChild(spore.sprite, 4);

            this.spores.push(spore);
        }

        objectGroup = this.tileMap.getObjectGroup("Collision");

        for (var l = 0; l < objectGroup.getObjects().length; l++) {

            var doorObj = objectGroup.getObjects()[l];

            if (doorObj.type.match("door_object") != null) {
                var door = new Door();

                door.init(doorObj);

                this.tileMap.addChild(door.sprite);

                for (var m = 0; m < this.keys.length; m++) {
                    var obj1 = this.keys[m];

                    if (obj1.key == door.key) {
                        obj1.sprite.setColor(keyColors[m]);
                        door.sprite.setColor(keyColors[m]);
                    }
                }

                this.doors.push(door);
            }
        }

        this.eaters = [];

        objectGroup = this.tileMap.getObjectGroup("Enemies");

        for (var j = 0; j < objectGroup.getObjects().length; j++) {

            var enemyObj = objectGroup.getObjects()[j];

            var eater = new Eater();
            eater.init();
            eater.position = cc.p(enemyObj.x, enemyObj.y);

            this.tileMap.addChild(eater.sprite);

            this.eaters.push(eater);
        }

        objectGroup = this.tileMap.getObjectGroup("Particles");

        if (objectGroup) {
            for (var n = 0; n < objectGroup.getObjects().length; n++) {

                var particleObj = objectGroup.getObjects()[n];

                var particle = new cc.ParticleSystemQuad();
                particle.initWithFile("/res/" + particleObj.type);
                particle.setPosition(cc.p(particleObj.x + particleObj.width / 2, particleObj.y + particleObj.height / 2));
                particle.setPositionType(cc.PARTICLE_TYPE_RELATIVE);

                this.tileMap.addChild(particle, 10);
            }
        }

        this.scheduleUpdate();

        this.schedule(function () {

            if (!this.player.isDead && this.secondCounter >= 0 && !this.isPaused) {
                if (this.secondCounter <= 0) {
                    this.blowUp();
                }
                this.secondCounter--;

                if (this.secondCounter <= 2 && this.secondCounter >= 0 && this.colourLayer.numberOfRunningActions() == 0) {
                    var sequence = new cc.Sequence();

                    var fadeIn = new cc.FadeTo();
                    fadeIn.initWithDuration(0.1, 100);

                    var fadeOut = new cc.FadeTo();
                    fadeOut.initWithDuration(0.1, 0);

                    sequence.initOneTwo(fadeIn, fadeOut);
                    this.colourLayer.runAction(sequence);
                }

                this.font.setString(this.secondCounter);
            }
        }, 1, null ,10);

        return true;
    },
    moveCameraToLastBeacon:function () {
        var rect = this.player.lastSpawnBeacon.collisionBox;
        var position = cc.p(rect.origin.x + rect.size.width / 2, rect.origin.y + rect.size.height / 2);

        this.camera.updateHard(this.tileMap, position);
    },
    respawnPlayer:function () {
        this.player.sprite.setOpacity(255);
        this.player.position = cc.p(this.player.lastSpawnBeacon.position.x + this.player.lastSpawnBeacon.getBoundingBox().size.width / 2, this.player.lastSpawnBeacon.position.y + this.player.lastSpawnBeacon.getBoundingBox().size.height / 2);
        this.player.spawnJump();
        if (this.player.nextDirection != null) {
            this.player.direction = this.player.nextDirection;
        }

        if (this.player.lastSpawnBeacon.sporeType == SporeTypeEnum.FIRE) {
            this.player.powerUp = firePowerUp;
        } else if (this.player.lastSpawnBeacon.sporeType == SporeTypeEnum.WATER) {
            this.player.powerUp = waterPowerUp;
        } else if (this.player.lastSpawnBeacon.sporeType == SporeTypeEnum.FLOAT) {
            this.player.powerUp = floatyPowerUp;
        } else {
            this.player.powerUp = noPowerUp;
        }

        this.player.sprite.setColor(this.player.powerUp.playerColour());

        this.player.isDead = false;
        this.isResetting = false;
        this.player.shouldBlowUp = false;
    },
    animateSpawnBeacon:function () {
        this.player.lastSpawnBeacon.sprite.stopAllActions();
        var animate = cc.Animate.create(this.player.lastSpawnBeacon.spawnAnimation);
        this.player.lastSpawnBeacon.sprite.runAction(animate);
    },
    blowUp:function () {
        if (this.player.lastSpawnBeacon != null && this.player.lastSpawnBeacon instanceof Spore) {
            this.player.kill();

            var particle = cc.ParticleSystemQuad.create("/res/player_die_particle.plist");
            particle.setPosition(cc.p(this.player.position.x + this.player.sprite.getBoundingBox().size.width / 2, this.player.position.y + this.player.sprite.getBoundingBox().size.height / 2));
            particle.setAutoRemoveOnFinish(true);
            this.tileMap.addChild(particle, 7);

            var delay = cc.DelayTime.create(1);
            var moveCamera = cc.CallFunc.create(this.moveCameraToLastBeacon, this, null);
            var delay2 = cc.DelayTime.create(0.1);
            var animate = cc.CallFunc.create(this.animateSpawnBeacon, this, null);
            var delay3 = cc.DelayTime.create(0.4);
            var respawnPlayer = cc.CallFunc.create(this.respawnPlayer, this, null);

            var sequence = cc.Sequence.create([delay, moveCamera, delay2, animate, delay3, respawnPlayer]);

            this.runAction(sequence);

            this.secondCounter = 11;
        }
    },
    setViewPointCenter:function () {
        this.camera.update(this.tileMap, this.player);
    },
    update:function (delta) {

        this.delta += delta;

        if (this.delta >= this.timeStep && !this.isPaused) {
            this.player.update(delta, this.camera);

            this.egg.update(delta);

            this.player.testCollision(this.tileMap.getObjectGroup("Collision"), this.camera);

            this.player.testBeacon(this.spores, this.camera);

            this.player.testDoors(this.doors, this.tileMap.getObjectGroup("Collision"), this.keys);

            this.player.testKeys(this.keys);

            if (this.player.testGoal(this.egg)) {
                this.player.isDead = true;
                this.unscheduleAllCallbacks();
                this.gotoNextLevel();
            }

            for (var i = 0; i < this.spores.length; i++) {
                this.spores[i].update(delta);
            }

            for (var j = 0; j < this.eaters.length; j++) {
                this.eaters[j].update(delta);
                this.eaters[j].testCollision(this.tileMap.getObjectGroup("Collision"));
                this.eaters[j].testPathFinding(this.tileMap.getObjectGroup("PathFinding"));

                if (this.eaters[j].testPlayer(this.player) && !this.isResetting) {
                    this.isResetting = true;
                    this.blowUp();
                }

            }

            for (var k = 0; k < this.doors.length; k++) {
                this.doors[k].update(delta);
            }

            for (var m = 0; m < this.keys.length; m++) {
                this.keys[m].update(delta);
            }

            if (this.player.shouldBlowUp && !this.isResetting) {
                this.isResetting = true;
                this.blowUp();
            }

            this.setViewPointCenter();

            if (Keys[cc.KEY.y] && !this.isResetting) {
                this.isResetting = true;
                this.blowUp();
            }
        }

        if (Keys[cc.KEY.escape] && this.pauseButtonTick <= 0) {
            this.isPaused = !this.isPaused;
            this.pauseButtonTick = 0.3;
        }

        if (this.isPaused) {
            this.pauseFont.setVisible(true);
        } else {
            this.pauseFont.setVisible(false);
        }

        this.pauseButtonTick-=delta;
    },
    gotoNextLevel:function() {
        levelIndex++;
        cc.Director.getInstance().replaceScene(cc.TransitionFade.create(12, new HelloWorldScene(), new cc.Color3B(0,0,0)));
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

        var level;

        if (level == null) {
            level = "/res/level" + levelIndex + ".tmx";
        }

        var layer;
        if (levelIndex > 12) {
//        layer = GameOverScene.layer();
        } else {
            layer = new Helloworld();
            layer.init(level);
        }

        this.addChild(layer);
    }
});

