/**
 * Created with JetBrains WebStorm.
 * User: kylereczek
 * Date: 2013-08-24
 * Time: 8:24 PM
 * To change this template use File | Settings | File Templates.
 */

var Eater = cc.Node.extend({
    sprite:null,
    velocity:null,
    desiredPosition:null,
    walkAnimation:null,
    isLeft:false,
    eatAnimation:null,
    collisionRect:null,
    lastPathFindingCollidedWith:null,
    isEating:false,
    isDead:false,
    isCleanUp:false,
    init:function () {
        this.walkAnimation = new cc.Animation();

        this.walkAnimation.initWithSpriteFrames(
            [cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_walk 1.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_walk 2.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_walk 3.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_walk 4.png")], 0.1);

        this.eatAnimation = new cc.Animation();

        this.eatAnimation.initWithSpriteFrames(
            [cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_eat 1.png"),
            cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_eat 2.png"),
            cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_eat 1.png"),
            cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_eat 2.png"),
            cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_eat 1.png"),
            cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_eat 2.png")], 0.1);

        this.sprite = new cc.Sprite();

        this.sprite.initWithSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_walk 1.png"));

        this.sprite.setScaleX(5);
        this.sprite.setScaleY(5);

        this.sprite.getTexture().setAliasTexParameters();

        this.velocity = cc.p(0, 0);

        this.isDead = false;
    },
    kill:function() {
        if (!this.isDead) {
            this.isDead = true;

            var fadeOut = cc.FadeOut.create(0.5);

            var particle = cc.ParticleSystemQuad.create("/res/player_die_particle.plist");
            particle.setPosition(cc.p(this.position.x + this.sprite.getBoundingBox().size.width / 2, this.position.y + this.sprite.getBoundingBox().size.height / 2));
            particle.setAutoRemoveOnFinish(true);

            this.sprite.getParent().addChild(particle, 7);

            this.sprite.runAction(fadeOut);
        }
    },
    update:function (delta) {

        if (this.isDead && this.sprite.numberOfRunningActions() == 0) {
            this.isCleanUp = true;
        }

        if (!this.isEating && !this.isDead) {
            this.sprite.setPosition(cc.p(this.position.x + this.sprite.getBoundingBox().size.width / 2, this.position.y + this.sprite.getBoundingBox().size.height / 2));

            if (this.collisionRect == null) {
                this.collisionRect = cc.RectMake(
                    0,
                    0,
                    this.sprite.getTextureRect().size.width,
                    this.sprite.getTextureRect().size.height);
            }

            var gravity = cc.p(0.0, -640.0);
            var gravityStep = cc.pMult(gravity, delta);

            var forwardMove = cc.p(1090, 0);
            var forwardStep = cc.pMult(forwardMove, delta);

            this.velocity = cc.pAdd(this.velocity, gravityStep);
            this.velocity = cc.p(this.velocity.x * 0.89, this.velocity.y);

            if (this.isLeft) {
                this.velocity = cc.pSub(this.velocity, forwardStep);
            } else {
                this.velocity = cc.pAdd(this.velocity, forwardStep);
            }

            var minMovement = cc.p(-850, -450);
            var maxMovement = cc.p(850, 350);

            this.velocity = cc.pClamp(this.velocity, minMovement, maxMovement);

            var stepVelocity = cc.pMult(this.velocity, delta);

            this.desiredPosition = cc.pAdd(this.position, stepVelocity);

            this.collisionRect.origin = this.desiredPosition;

            this.sprite.setFlipX(this.isLeft);

            this.sprite.setFlipY(false);

            if (this.isOnGround && Math.abs(this.velocity.x) > 10 && this.sprite.numberOfRunningActions() == 0) {
                var animate = new cc.Animate();

                animate.setTag(1);

                animate.initWithAnimation(this.walkAnimation);
                var repeat = cc.RepeatForever.create(animate);

                this.sprite.runAction(repeat);
            }

            if (this.isOnGround && Math.abs(this.velocity.x) < 10) {
                this.sprite.stopAllActions();

                this.sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("eater_walk 1.png"));
            }
        }
    },
    testCollision:function (objects) {
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

                if (obj.type == "LAVA" || obj.type == "WATER") {
                    this.kill();
                }

                var intersection = cc.Rect.CCRectIntersection(rect, collisionRect);

                if (intersection.size.width < intersection.size.height) {
                    if (intersection.origin.x > this.desiredPosition.x) {
                        this.desiredPosition = cc.p(this.desiredPosition.x - intersection.size.width, this.desiredPosition.y);
                        this.velocity = cc.p(0, this.velocity.y);
                        this.isLeft = !this.isLeft;
                    } else {
                        this.desiredPosition = cc.p(this.desiredPosition.x + intersection.size.width, this.desiredPosition.y);
                        this.velocity = cc.p(0, this.velocity.y);
                        this.isLeft = !this.isLeft;
                    }
                } else if (intersection.size.width > intersection.size.height) {
                    if (intersection.origin.y > this.desiredPosition.y) {
                        this.desiredPosition = cc.p(this.desiredPosition.x, this.desiredPosition.y - intersection.size.height);
                        this.velocity = cc.p(this.velocity.x, 0);
                    } else if (intersection.origin.y == this.desiredPosition.y) {
                        this.desiredPosition = cc.p(this.desiredPosition.x, this.desiredPosition.y + intersection.size.height);
                        this.velocity = cc.p(this.velocity.x, 0);
                        this.isOnGround = true;
                    }

                }

            }
        }

        this.position = cc.p(this.desiredPosition.x, this.desiredPosition.y);
    },
    testPathFinding:function (objects) {
        var collisionRect = cc.RectMake(
            this.desiredPosition.x,
            this.desiredPosition.y,
            this.sprite.getTextureRect().size.width,
            this.sprite.getTextureRect().size.height);

        for (var i = 0; i < objects.getObjects().length; i++) {
            var obj = objects.getObjects()[i];
            var rect = cc.RectMake(obj.x, obj.y, obj.width, obj.height);

            if (cc.Rect.CCRectIntersectsRect(rect, collisionRect) && this.lastPathFindingCollidedWith != obj) {
                this.isLeft = !this.isLeft;
                this.lastPathFindingCollidedWith = obj;
            }
        }

    },
    resumeWalking:function() {
        this.isEating = false;
    },
    testPlayer:function (player) {
        var collisionRect = cc.RectMake(
            this.desiredPosition.x+10,
            this.desiredPosition.y,
            this.sprite.getTextureRect().size.width+10,
            this.sprite.getTextureRect().size.height);

        if (cc.Rect.CCRectIntersectsRect(player.collisionRect, collisionRect) && !this.isEating) {
            this.isEating = true;

            var animation = new cc.Animate();
            animation.initWithAnimation(this.eatAnimation);

            var sequence = new cc.Sequence();

            sequence.initOneTwo(animation, cc.CallFunc.create(this.resumeWalking, this, null));

            this.sprite.stopAllActions();

            this.sprite.runAction(sequence);

            return true;
        }

        return false;
    }



});