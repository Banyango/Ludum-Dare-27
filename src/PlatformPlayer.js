//noinspection JSValidateTypes
var PlatformPlayer = cc.Node.extend({
    id:null,
    sprite:null,
    speed:220,
    jumpTimer:null,
    velocity:null,
    desiredPosition:null,
    collisionRect:null,
    isOnGround:null,
    isLeft:false,
    runAnimation:null,
    init:function () {
        this.sprite = new cc.Sprite();

        this.sprite.initWithSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player.png"));

        this.sprite.getTexture().setAliasTexParameters();

        this.runAnimation = new cc.Animation();

        this.runAnimation.initWithSpriteFrames(
            [cc.SpriteFrameCache.getInstance().getSpriteFrame("player_running_1.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_running_2.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("player_running_3.png")], 0.1);

        this.sprite.position = this.position;

        this.velocity = cc.p(0, 0);

        return this;
    },
    update:function (delta) {

        if (delta > 0.6) {
            delta = 0.01;
        }

        this.sprite.setPosition(cc.p(this.position.x + this.sprite.getTextureRect().size.width / 2, this.position.y + this.sprite.getTextureRect().size.height / 2));

        if (this.collisionRect == null) {
            this.collisionRect = cc.RectMake(
                0,
                0,
                this.sprite.getTextureRect().size.width,
                this.sprite.getTextureRect().size.height);
        }

        var gravity = cc.p(0.0, -640.0);
        var gravityStep = cc.pMult(gravity, delta);

        var forwardMove = cc.p(950, 0);
        var forwardStep = cc.pMult(forwardMove, delta);

        this.velocity = cc.pAdd(this.velocity, gravityStep);
        this.velocity = cc.p(this.velocity.x * 0.93, this.velocity.y);

        if (this.isOnGround && (Keys[cc.KEY.up] || Keys[cc.KEY.w])) {
            var jumpVelocity = cc.p(0, 9500);
            this.velocity = cc.pAdd(this.velocity, jumpVelocity);
            cc.AudioEngine.getInstance().playEffect("/res/alien_hurt_3.wav", false);
        }

        if (this.isOnGround && Math.abs(this.velocity.x) > 5 && this.sprite.numberOfRunningActions() == 0) {
            var animate = new cc.Animate();

            animate.initWithAnimation(this.runAnimation);
            var repeat = cc.RepeatForever.create(animate);

            this.sprite.runAction(repeat);

        }

        if(this.isOnGround && Math.abs(this.velocity.x) < 10 && this.sprite.numberOfRunningActions() != 0){
            this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player.png"));
        }

        if ((Keys[cc.KEY.a] || Keys[cc.KEY.left])) {
            this.velocity = cc.pSub(this.velocity, forwardStep);
            this.isLeft = true;
        }

        if ((Keys[cc.KEY.t])) {
            this.position = cc.p(cc.Director.getInstance().width / 2, cc.Director.getInstance().height / 2);
        }

        if ((Keys[cc.KEY.d] || Keys[cc.KEY.right])) {
            this.velocity = cc.pAdd(this.velocity, forwardStep);
            this.isLeft = false;
        }

        var minMovement = cc.p(-850, -450);
        var maxMovement = cc.p(850, 350);

        if (this.velocity.y > 0) {
            this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_jumping.png"))
        }

        this.velocity = cc.pClamp(this.velocity, minMovement, maxMovement);

        var stepVelocity = cc.pMult(this.velocity, delta);

        this.desiredPosition = cc.pAdd(this.position, stepVelocity);

        this.collisionRect.origin = this.desiredPosition;

        this.sprite.setFlipX(!this.isLeft);

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

                if (intersection.size.width < intersection.size.height) {
                    if (intersection.origin.x > this.desiredPosition.x) {
                        this.desiredPosition = cc.p(this.desiredPosition.x - intersection.size.width, this.desiredPosition.y);
                        this.velocity = cc.p(0, this.velocity.y);

                        if (obj.type == "ladder") {
                            this.velocity = cc.p(0, 0);
                            this.isOnGround = true;
                            camera.isPlatformLockCamera = false;
                            this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_clinging.png"));
                        }

                    } else {
                        this.desiredPosition = cc.p(this.desiredPosition.x + intersection.size.width, this.desiredPosition.y);

                        this.velocity = cc.p(0, this.velocity.y);
                        if (obj.type == "ladder") {
                            this.velocity = cc.p(0, 0);
                            this.isOnGround = true;
                            camera.isPlatformLockCamera = false;
                            this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player_clinging.png"));
                        }
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
        }

        this.position = cc.p(this.desiredPosition.x, this.desiredPosition.y);
    }


});