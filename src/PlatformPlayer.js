var AnimationEnum = {
    IDLE:0,
    RUN:1,
    JUMP:2
};

var DirectionEnum = {
    UP:"UP",
    DOWN:"DOWN"
};

//noinspection JSValidateTypes
var PlatformPlayer = cc.Node.extend({
    id:null,
    sprite:null,
    speed:250,
    jumpTimer:null,
    velocity:null,
    desiredPosition:null,
    collisionRect:null,
    isOnGround:null,
    isLeft:false,
    idleAnimation:null,
    lastSpawnBeacon:null,
    displayedFrame:null,
    direction:DirectionEnum.UP,
    nextDirection:null,
    isDead:false,
    shouldBlowUp:null,
    powerUp:null,
    spawnBurst:0,
    init:function () {
        this.sprite = new cc.Sprite();

        this.sprite.initWithSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 1.png"));

        this.sprite.getTexture().setAliasTexParameters();

        this.idleAnimation = new cc.Animation();

        this.idleAnimation.initWithSpriteFrames(
            [cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 1.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 2.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 3.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 4.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 3.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 2.png")], 0.08);

        this.sprite.position = this.position;

        this.velocity = cc.p(0, 0);

        this.powerUp = noPowerUp;

        this.sprite.setColor(noPowerUp.playerColour());

        return this;
    },
    kill:function() {
        this.isDead = true;

        var fadeOut = cc.FadeOut.create(0.5);

        this.sprite.runAction(fadeOut);

        cc.AudioEngine.getInstance().playEffect("/res/hurt.wav", false);
    },
    spawnJump:function(){
        var jumpVelocity;

        this.velocity = cc.p(0, 0);

        if (this.direction == DirectionEnum.UP) {
            jumpVelocity = cc.p(0, 9500);
            this.velocity = cc.pAdd(this.velocity, jumpVelocity);
        } else if (this.direction == DirectionEnum.DOWN) {
            jumpVelocity = cc.p(0, -9500);
            this.velocity = cc.pAdd(this.velocity, jumpVelocity);
        }
    },
    spawnJumpHigh:function(){
        var jumpVelocity;

        this.velocity = cc.p(0, 0);

        if (this.direction == DirectionEnum.UP) {
            jumpVelocity = cc.p(0, 25500);
            this.velocity = cc.pAdd(this.velocity, jumpVelocity);
        } else if (this.direction == DirectionEnum.DOWN) {
            jumpVelocity = cc.p(0, -25500);
            this.velocity = cc.pAdd(this.velocity, jumpVelocity);
        }

        this.spawnBurst = 12000;
    },
    velocityUp:function (delta) {
        var gravity = cc.p(0.0, -640.0);
        var gravityStep = cc.pMult(gravity, delta);

        var forwardMove = cc.p(680, 0);
        var forwardStep = cc.pMult(forwardMove, delta);

        this.velocity = cc.pAdd(this.velocity, gravityStep);
        this.velocity = cc.p(this.velocity.x * 0.89, this.velocity.y);

        if (this.isOnGround && (Keys[cc.KEY.space])) {
            var jumpVelocity = cc.p(0, 8700);
            this.velocity = cc.pAdd(this.velocity, jumpVelocity);
            cc.AudioEngine.getInstance().playEffect("/res/jump.wav", false);
        }

        if ((Keys[cc.KEY.a] || Keys[cc.KEY.left])) {
            this.velocity = cc.pSub(this.velocity, forwardStep);
            this.isLeft = false;
        }

        if ((Keys[cc.KEY.d] || Keys[cc.KEY.right])) {
            this.velocity = cc.pAdd(this.velocity, forwardStep);
            this.isLeft = true;
        }

        var minMovement = cc.p(-850, -450);
        var maxMovement = cc.p(850, 350 + this.spawnBurst);

        this.velocity = cc.pClamp(this.velocity, minMovement, maxMovement);

        this.spawnBurst = 0;
    },
    velocityDown:function (delta) {
        var gravity = cc.p(0.0, 640.0);
        var gravityStep = cc.pMult(gravity, delta);

        var forwardMove = cc.p(680, 0);
        var forwardStep = cc.pMult(forwardMove, delta);

        this.velocity = cc.pAdd(this.velocity, gravityStep);
        this.velocity = cc.p(this.velocity.x * 0.89, this.velocity.y);

        if (this.isOnGround && (Keys[cc.KEY.space])) {
            var jumpVelocity = cc.p(0, -8700);
            this.velocity = cc.pAdd(this.velocity, jumpVelocity);
            cc.AudioEngine.getInstance().playEffect("/res/jump.wav", false);
        }

        if ((Keys[cc.KEY.a] || Keys[cc.KEY.left])) {
            this.velocity = cc.pSub(this.velocity, forwardStep);
            this.isLeft = false;
        }

        if ((Keys[cc.KEY.t])) {
            this.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);
        }

        if ((Keys[cc.KEY.d] || Keys[cc.KEY.right])) {
            this.velocity = cc.pAdd(this.velocity, forwardStep);
            this.isLeft = true;
        }

        var minMovement = cc.p(-850, 450);
        var maxMovement = cc.p(850, -450 - this.spawnBurst);

        this.velocity = cc.pClamp(this.velocity, minMovement, maxMovement);

        this.spawnBurst = 0;
    },
    update:function (delta, camera) {

        if (!this.isDead) {
            this.sprite.setPosition(cc.p(this.position.x + this.sprite.getBoundingBox().size.width / 2, this.position.y + this.sprite.getBoundingBox().size.height / 2));

            if (this.collisionRect == null) {
                this.collisionRect = cc.RectMake(
                    0,
                    0,
                    this.sprite.getTextureRect().size.width,
                    this.sprite.getTextureRect().size.height);
            }

            if (this.direction == DirectionEnum.UP) {
                this.velocityUp(delta);
                this.renderSpritesUp(camera);
            } else if (this.direction == DirectionEnum.DOWN) {
                this.velocityDown(delta);
                this.renderSpritesDown(camera);
            }

            var stepVelocity = cc.pMult(this.velocity, delta);

            this.desiredPosition = cc.pAdd(this.position, stepVelocity);

            this.collisionRect.origin = this.desiredPosition;
        }

    },
    doOnCollisionUp:function (rect, obj, camera, intersection) {

        if (intersection.size.width < intersection.size.height) {
            if (intersection.origin.x > this.desiredPosition.x) {
                this.desiredPosition = cc.p(this.desiredPosition.x - intersection.size.width, this.desiredPosition.y);
                this.velocity = cc.p(0, this.velocity.y);
            } else {
                this.desiredPosition = cc.p(this.desiredPosition.x + intersection.size.width, this.desiredPosition.y);

                this.velocity = cc.p(0, this.velocity.y);
            }
        } else if (intersection.size.width > intersection.size.height) {
            if (intersection.origin.y > this.desiredPosition.y) {
                this.desiredPosition = cc.p(this.desiredPosition.x, this.desiredPosition.y - intersection.size.height);
                this.velocity = cc.p(this.velocity.x, 0);
            } else if (intersection.origin.y == this.desiredPosition.y) {
                this.desiredPosition = cc.p(this.desiredPosition.x, this.desiredPosition.y + intersection.size.height);

                if (camera != null) {
                    camera.updatePosition(cc.p(this.desiredPosition.x, this.desiredPosition.y));
                }

                this.velocity = cc.p(this.velocity.x, 0);
                this.isOnGround = true;
                camera.isPlatformLockCamera = true;
            }
        }

    },
    doOnCollisionDown:function (rect, obj, camera, intersection) {
        if (intersection.size.width < intersection.size.height) {
            if (intersection.origin.x > this.desiredPosition.x) {
                this.desiredPosition = cc.p(this.desiredPosition.x - intersection.size.width, this.desiredPosition.y);
                this.velocity = cc.p(0, this.velocity.y);
            } else {
                this.desiredPosition = cc.p(this.desiredPosition.x + intersection.size.width, this.desiredPosition.y);

                this.velocity = cc.p(0, this.velocity.y);
            }
        } else if (intersection.size.width > intersection.size.height) {
            if (intersection.origin.y > this.desiredPosition.y) {
                this.desiredPosition = cc.p(this.desiredPosition.x, this.desiredPosition.y - intersection.size.height);
                this.velocity = cc.p(this.velocity.x, 0);
                if (camera != null) {
                    camera.updatePosition(cc.p(this.desiredPosition.x, this.desiredPosition.y));
                }
                this.isOnGround = true;
                camera.isPlatformLockCamera = true;
            } else if (intersection.origin.y == this.desiredPosition.y) {
                this.desiredPosition = cc.p(this.desiredPosition.x, this.desiredPosition.y + intersection.size.height);
                this.velocity = cc.p(this.velocity.x, 0);
            }
        }
    },
    renderSpritesUp:function(camera) {
        this.sprite.setFlipX(!this.isLeft);

        this.sprite.setFlipY(false);

        if (this.velocity.y < -400) {
            if (camera) {
                camera.isPlatformLockCamera = false;
            }
        }

        if (this.velocity.y < -100) {
            this.sprite.stopAllActions();

            this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_jumping.png"));

            this.displayedFrame = AnimationEnum.JUMP;
        }

        if (this.velocity.y > 10 && this.displayedFrame != AnimationEnum.JUMP) {
            this.sprite.stopAllActions();

            this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_jumping.png"));

            this.displayedFrame = AnimationEnum.JUMP;
        }

        if (this.isOnGround && Math.abs(this.velocity.x) > 10 && this.sprite.numberOfRunningActions() == 0 &&
            this.displayedFrame != AnimationEnum.RUN) {
            var animate = new cc.Animate();

            animate.setTag(1);

            animate.initWithAnimation(this.idleAnimation);
            var repeat = cc.RepeatForever.create(animate);

            this.sprite.runAction(repeat);

            this.displayedFrame = AnimationEnum.RUN;

        }

        if (this.isOnGround && Math.abs(this.velocity.x) < 10 && this.displayedFrame != AnimationEnum.IDLE) {
            this.sprite.stopAllActions();

            this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 1.png"));

            this.displayedFrame = AnimationEnum.IDLE;
        }
    },
    renderSpritesDown:function(camera) {
        this.sprite.setFlipX(!this.isLeft);

        this.sprite.setFlipY(true);

        if (this.velocity.y > 400) {
            if (camera) {
                camera.isPlatformLockCamera = false;
            }
        }

        if (this.velocity.y > 100) {
            this.sprite.stopAllActions();

            this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_jumping.png"));

            this.displayedFrame = AnimationEnum.JUMP;
        }

        if (this.velocity.y < -10 && this.displayedFrame != AnimationEnum.JUMP) {
            this.sprite.stopAllActions();

            this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_jumping.png"));

            this.displayedFrame = AnimationEnum.JUMP;
        }

        if (this.isOnGround && Math.abs(this.velocity.x) > 10 && this.sprite.numberOfRunningActions() == 0 &&
            this.displayedFrame != AnimationEnum.RUN) {
            var animate = new cc.Animate();

            animate.setTag(1);

            animate.initWithAnimation(this.idleAnimation);
            var repeat = cc.RepeatForever.create(animate);

            this.sprite.runAction(repeat);

            this.displayedFrame = AnimationEnum.RUN;

        }

        if (this.isOnGround && Math.abs(this.velocity.x) < 10 && this.displayedFrame != AnimationEnum.IDLE) {
            this.sprite.stopAllActions();

            this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 1.png"));

            this.displayedFrame = AnimationEnum.IDLE;
        }
    },
    testCollision:function (objects, camera) {
        this.isOnGround = false;

        var collisionRect = cc.RectMake(
            this.desiredPosition.x,
            this.desiredPosition.y,
            this.sprite.getTextureRect().size.width,
            this.sprite.getTextureRect().size.height);

        for (var i = 0; i < objects.getObjects().length; i++) {

            var obj = objects.getObjects()[i];
            var rect = cc.RectMake(obj.x, obj.y, obj.width, obj.height);

            if (cc.Rect.CCRectIntersectsRect(rect, collisionRect)) {

                var intersection = cc.Rect.CCRectIntersection(rect, collisionRect);
                var skipCollision = false;

                if (obj.type == "LAVA" && !this.powerUp.isFireProof()) {
                    this.shouldBlowUp = true;
                } else if (obj.type == "WATER" && !this.powerUp.isWaterProof()) {
                    this.shouldBlowUp = true;
                } else if (obj.type == "WATER" && this.powerUp.isWaterProof()) {
                    skipCollision = true;
                }

                if (!skipCollision) {
                    if (this.direction == DirectionEnum.UP) {
                        this.doOnCollisionUp(rect, obj, camera, intersection);
                    } else if (this.direction == DirectionEnum.DOWN) {
                        this.doOnCollisionDown(rect, obj, camera, intersection);
                    }
                }
            }

        }

        this.position = cc.p(this.desiredPosition.x, this.desiredPosition.y);
    },
    testBeacon:function (objects) {

        var collisionRect = cc.RectMake(
            this.desiredPosition.x,
            this.desiredPosition.y,
            this.sprite.getTextureRect().size.width,
            this.sprite.getTextureRect().size.height);

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var rect = obj.collisionBox;

            if (cc.Rect.CCRectIntersectsRect(rect, collisionRect)) {
                this.lastSpawnBeacon = obj;
                this.nextDirection = obj.direction;

                if (!obj.isActive) {
                    for (var j = 0; j < objects.length; j++) {
                        var obj1 = objects[j];
                        obj1.deActivate();
                    }

                    obj.activate();
                }
            }
        }
    },
    testDoors:function (objects, collisionObjects, keysOnLevel) {

        var collisionRect = cc.RectMake(
            this.desiredPosition.x,
            this.desiredPosition.y,
            this.sprite.getTextureRect().size.width,
            this.sprite.getTextureRect().size.height);

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var rect = obj.collisionBox;

            if (cc.Rect.CCRectIntersectsRect(rect, collisionRect)) {
                if (!obj.isOpen) {
                    for (var j = 0; j < keysOnLevel.length; j++) {
                        var key = keysOnLevel[j];

                        if (key.isCollected && key.key == obj.key) {
                            obj.open(collisionObjects);
                        }
                    }
                }
            }
        }
    },
    testKeys:function (objects) {

        var collisionRect = cc.RectMake(
            this.desiredPosition.x,
            this.desiredPosition.y,
            this.sprite.getTextureRect().size.width,
            this.sprite.getTextureRect().size.height);

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var rect = obj.collisionBox;

            if (cc.Rect.CCRectIntersectsRect(rect, collisionRect)) {
                if (!obj.isCollected) {
                    obj.collect();
                }
            }
        }
    },
    testGoal:function (egg) {

        var collisionRect = cc.RectMake(
            this.desiredPosition.x,
            this.desiredPosition.y,
            this.sprite.getTextureRect().size.width,
            this.sprite.getTextureRect().size.height);

            var rect = egg.collisionBox;

            if (cc.Rect.CCRectIntersectsRect(rect, collisionRect)) {
                this.sprite.setVisible(false);
                egg.runWinAnimation();
                return true;
            }

        return false;
    }
});

var noPowerUp = {
    isFireProof:function () {
        return false;
    },
    isWaterProof:function () {
        return false;
    },
    canFloat:function () {
        return false;
    },
    antiGravityAmount:function () {
        return cc.p(0,0);
    },
    playerColour:function () {
        return new cc.Color3B(46,153,102);
    }
};

var firePowerUp = {
    isFireProof:function () {
        return true;
    },
    isWaterProof:function () {
        return false;
    },
    canFloat:function () {
        return false;
    },
    antiGravityAmount:function () {
        return cc.p(0,0);
    },
    playerColour:function () {
        return new cc.Color3B(201,44,52);
    }
};

var waterPowerUp = {
    isFireProof:function () {
        return false;
    },
    isWaterProof:function () {
        return true;
    },
    canFloat:function () {
        return false;
    },
    antiGravityAmount:function () {
        return cc.p(0, 30);
    },
    playerColour:function () {
        return new cc.Color3B(53,102,203);
    }
};

var floatyPowerUp = {
    isFireProof:function () {
        return false;
    },
    isWaterProof:function () {
        return false;
    },
    canFloat:function () {
        return true;
    },
    antiGravityAmount:function () {

    },
    playerColour:function () {
        return new cc.Color3B(50,50,30);
    }
};

