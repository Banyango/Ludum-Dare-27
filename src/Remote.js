/**
 * Created with JetBrains WebStorm.
 * User: kylereczek
 * Date: 2013-08-18
 * Time: 4:45 PM
 * To change this template use File | Settings | File Templates.
 */

var Remote = cc.Node.extend({
    id:null,
    sprite:null,
    init:function () {
        this.sprite = new cc.Sprite();
        this.sprite.initWithSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("player.png"));
        this.sprite.position = this.position;
        this.sprite.setAnchorPoint(cc.p(0, 0));
        return this;
    },
    update:function (delta) {
        if (this.position != null) {
            this.sprite.setPosition(cc.p(this.position.x, this.position.y));
        }
    }
});