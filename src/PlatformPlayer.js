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
    runAnimation:null,
    lastSpawnBeacon:null,
    displayedFrame:null,
    direction:DirectionEnum.UP,
    nextDirection:null,
    velocityUp:function (delta) {
        var gravity = cc.p(0.0, -640.0);
        var gravityStep = cc.pMult(gravity, delta);

        var forwardMove = cc.p(990, 0);
        var forwardStep = cc.pMult(forwardMove, delta);

        this.velocity = cc.pAdd(this.velocity, gravityStep);
        this.velocity = cc.p(this.velocity.x * 0.89, this.velocity.y);

        if (this.isOnGround && (Keys[cc.KEY.space])) {
            var jumpVelocity = cc.p(0, 9500);
            this.velocity = cc.pAdd(this.velocity, jumpVelocity);
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

        var minMovement = cc.p(-850, -450);
        var maxMovement = cc.p(850, 350);

        this.velocity = cc.pClamp(this.velocity, minMovement, maxMovement);
    },
    velocityDown:function (delta) {
        var gravity = cc.p(0.0, 640.0);
        var gravityStep = cc.pMult(gravity, delta);

        var forwardMove = cc.p(990, 0);
        var forwardStep = cc.pMult(forwardMove, delta);

        this.velocity = cc.pAdd(this.velocity, gravityStep);
        this.velocity = cc.p(this.velocity.x * 0.89, this.velocity.y);

        if (this.isOnGround && (Keys[cc.KEY.space])) {
            var jumpVelocity = cc.p(0, -9500);
            this.velocity = cc.pAdd(this.velocity, jumpVelocity);
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

        var minMovement = cc.p(-850, 350);
        var maxMovement = cc.p(850, -450);

        this.velocity = cc.pClamp(this.velocity, minMovement, maxMovement);
    },
    init:function () {
        this.sprite = new cc.Sprite();

        this.sprite.initWithSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 1.png"));

        this.sprite.getTexture().setAliasTexParameters();

        this.runAnimation = new cc.Animation();

        this.runAnimation.initWithSpriteFrames(
            [cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 1.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 2.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 3.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 4.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 3.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_walking 2.png")], 0.14);

        this.sprite.position = this.position;

        this.velocity = cc.p(0, 0);

        return this;
    },
    update:function (delta, camera) {

        this.sprite.setPosition(cc.p(this.position.x + this.sprite.getTextureRect().size.width / 2, this.position.y + this.sprite.getTextureRect().size.height / 2));

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

    },
    testCollisionUp:function (rect, obj, camera, collisionRect) {
        if (cc.Rect.CCRectIntersectsRect(rect, collisionRect)) {

            var intersection = cc.Rect.CCRectIntersection(rect, collisionRect);

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

        }
    },
    testCollisionDown:function (rect, obj, camera, collisionRect) {
        if (cc.Rect.CCRectIntersectsRect(rect, collisionRect)) {

            var intersection = cc.Rect.CCRectIntersection(rect, collisionRect);

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

            animate.initWithAnimation(this.runAnimation);
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

            animate.initWithAnimation(this.runAnimation);
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

            if (this.direction == DirectionEnum.UP) {
                this.testCollisionUp(rect, obj, camera, collisionRect);
            } else if (this.direction == DirectionEnum.DOWN) {
                this.testCollisionDown(rect, obj, camera, collisionRect);
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

        for (var i = 0; i < objects.getObjects().length; i++) {
            var obj = objects.getObjects()[i];
            var rect = cc.RectMake(obj.x, obj.y, obj.width, obj.height);

            if (cc.Rect.CCRectIntersectsRect(rect, collisionRect)) {
                this.lastSpawnBeacon = cc.p(obj.x + obj.width / 2, obj.y + obj.height / 2);
                this.nextDirection = obj.type;
            }
        }
    }



});

