/**
 * Created with JetBrains WebStorm.
 * User: kylereczek
 * Date: 2013-08-24
 * Time: 1:44 PM
 * To change this template use File | Settings | File Templates.
 */

var Spore = cc.Node.extend({

    sprite:null,
    isActive:false,
    idleAnimation:null,
    spawnAnimation:null,
    activateAnimation:null,
    collisionBox:null,
    direction:null,
    initialize:function(){
        this.idleAnimation = new cc.Animation();

        this.idleAnimation.initWithSpriteFrames(
            [cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_idle 1.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_idle 2.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_idle 3.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_idle 4.png")], 0.1);

        this.spawnAnimation = new cc.Animation();

        this.spawnAnimation.initWithSpriteFrames(
            [cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_spawning 1.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_spawning 2.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_spawning 3.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_spawning 4.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_spawning 5.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_spawning 6.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_spawning 7.png")], 0.1);

        this.activateAnimation = new cc.Animation();

        this.activateAnimation.initWithSpriteFrames(
            [cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_activating 1.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_activating 2.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_activating 3.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_activating 4.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_activating 5.png"),
                cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_activating 6.png")], 0.1);


        this.sprite = new cc.Sprite();

        this.sprite.initWithSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("spore_activating 1.png"));

        this.sprite.setScaleX(5);
        this.sprite.setScaleY(5);

        this.sprite.getTexture().setAliasTexParameters();
    },
    update:function(delta){
        if (this.direction == "DOWN") {
            this.sprite.setFlipY(true);
            this.sprite.setPosition(cc.p(this.position.x + this.sprite.getBoundingBox().size.width / 2, this.position.y + this.sprite.getBoundingBox().size.height / 2 - this.collisionBox.size.height));
        } else if (this.direction == "UP") {
            this.sprite.setFlipY(false);
            this.sprite.setPosition(cc.p(this.position.x + this.sprite.getBoundingBox().size.width / 2, this.position.y + this.sprite.getBoundingBox().size.height / 2));
        }

    },
    activate:function(){
        if (!this.isActive) {
            this.sprite.stopAllActions();

            var animate = new cc.Animate();

            animate.initWithAnimation(this.activateAnimation);

            this.sprite.runAction(animate);

            this.isActive = true;
        }
    },
    deActivate:function(){
        if (this.isActive) {
            this.sprite.stopAllActions();

            var animate = new cc.Animate();

            animate.initWithAnimation(this.activateAnimation);

            this.sprite.runAction(animate.reverse());

            this.isActive = false;
        }
    }
});