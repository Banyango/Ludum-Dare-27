/**
 * Created with JetBrains WebStorm.
 * User: kylereczek
 * Date: 2013-08-25
 * Time: 2:01 PM
 * To change this template use File | Settings | File Templates.
 */

var Key = cc.Node.extend({
    key:null,
    isCollected:false,
    sprite:null,
    collisionBox:null,
    init:function (obj) {

        this.position = cc.p(obj.x, obj.y);

        this.collisionBox = cc.RectMake(obj.x, obj.y, obj.width, obj.height);

        this.sprite = new cc.Sprite();
        this.sprite.initWithFile("/res/key.png");
        this.sprite.setScaleX(5);
        this.sprite.setScaleY(5);
        this.sprite.getTexture().setAliasTexParameters();
        this.sprite.setOpacity(255);

        this.sprite.setPosition(cc.p(this.position.x + this.sprite.getBoundingBox().size.width / 2, this.position.y + this.sprite.getBoundingBox().size.height / 2));

        var moveUp = new cc.MoveBy();
        moveUp.initWithDuration(1, cc.p(0,10));

        var moveDown = new cc.MoveBy();
        moveDown.initWithDuration(1, cc.p(0, -10));

        var sequence = new cc.Sequence();
        sequence.initOneTwo(moveUp, moveDown);

        var repeatForever = new cc.RepeatForever();
        repeatForever.initWithAction(sequence);

        this.sprite.runAction(repeatForever);

        this.key = obj.type.replace("key", "").trim();
    },
    update:function (delta) {
        if (this.isCollected) {
            this.sprite.setOpacity(0);
        }


        this.sprite.setPosition(cc.p(this.position.x + this.sprite.getBoundingBox().size.width / 2, this.position.y + this.sprite.getBoundingBox().size.height / 2));
    },
    collect:function () {
        this.isCollected = true;
        this.sprite.setOpacity(0);
    }
});