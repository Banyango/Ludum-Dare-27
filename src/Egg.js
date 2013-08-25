/**
 * Created with JetBrains WebStorm.
 * User: kylereczek
 * Date: 2013-08-24
 * Time: 7:01 PM
 * To change this template use File | Settings | File Templates.
 */

var Egg = cc.Node.extend({

    sprite:null,
    winAnimation:null,
    collisionBox:null,
    direction:null,
    init:function(){

        this.winAnimation = new cc.Animation();

        this.winAnimation.initWithSpriteFrames(
            [cc.SpriteFrameCache.getInstance().getSpriteFrame("egg_goal 1.png"),
            cc.SpriteFrameCache.getInstance().getSpriteFrame("egg_goal 2.png"),
            cc.SpriteFrameCache.getInstance().getSpriteFrame("egg_goal 3.png"),
            cc.SpriteFrameCache.getInstance().getSpriteFrame("egg_goal 4.png"),
            cc.SpriteFrameCache.getInstance().getSpriteFrame("egg_goal 6.png")], 0.1);

        this.sprite = new cc.Sprite();

        this.sprite.initWithSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("egg_goal.png"));

        this.sprite.setScaleX(5);
        this.sprite.setScaleY(5);

        this.sprite.getTexture().setAliasTexParameters();

    },
    update:function(delta) {
        if (this.direction == "DOWN") {
            this.sprite.setFlipY(true);
            this.sprite.setPosition(cc.p(this.position.x + this.sprite.getBoundingBox().size.width / 2, this.position.y + this.sprite.getBoundingBox().size.height / 2 - this.collisionBox.size.height + 10));
        } else if (this.direction == "UP") {
            this.sprite.setFlipY(false);
            this.sprite.setPosition(cc.p(this.position.x + this.sprite.getBoundingBox().size.width / 2, this.position.y + this.sprite.getBoundingBox().size.height / 2 - 10));
        }
    },
    runWinAnimation: function() {

        var animation = new cc.Animate();
        animation.initWithAnimation(this.winAnimation);

        this.sprite.runAction(animation);

    }



});