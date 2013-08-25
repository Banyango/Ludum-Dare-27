/**
 * Created with JetBrains WebStorm.
 * User: kylereczek
 * Date: 2013-08-25
 * Time: 12:05 PM
 * To change this template use File | Settings | File Templates.
 */

var Door = cc.Node.extend({

    key:null,
    isOpen:false,
    sprite:null,
    tileMapObject:null,
    collisionBox:null,
    init:function(obj){

        this.position = cc.p(obj.x, obj.y);

        if (obj.type.match("open") != null) {
            this.isOpen = true;
        }

        this.key = obj.type.replace("open","").replace("door", "").trim();

        this.collisionBox = cc.RectMake(obj.x, obj.y, obj.width, obj.height);

        this.sprite = new cc.Sprite();
        this.sprite.initWithFile("/res/door.png");
        this.sprite.getTexture().setAliasTexParameters();
        this.sprite.setScaleX(obj.width / this.sprite.getTexture().getContentSizeInPixels().width);
        this.sprite.setScaleY(obj.height / this.sprite.getTexture().getContentSizeInPixels().height);

        this.tileMapObject = obj;
    },
    update:function(delta) {
        if (this.isOpen && this.sprite.numberOfRunningActions() == 0) {
            this.sprite.setOpacity(0);
        }
        this.sprite.setPosition(cc.p(this.position.x + this.sprite.getBoundingBox().size.width / 2, this.position.y + this.sprite.getBoundingBox().size.height / 2));
    },
    open:function(collisionObjects) {
        var fadeOut = new cc.FadeOut();
        fadeOut.initWithDuration(0.4);
        this.sprite.runAction(fadeOut);
        this.isOpen = true;
        collisionObjects.getObjects().splice(collisionObjects.getObjects().indexOf(this.tileMapObject), 1);
    }
});
