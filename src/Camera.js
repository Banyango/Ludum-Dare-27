//noinspection JSValidateTypes
/**
 * Created with JetBrains WebStorm.
 * User: kylereczek
 * Date: 2013-04-27
 * Time: 3:25 PM
 * To change this template use File | Settings | File Templates.
 */
var Camera = cc.Node.extend({
    isPlatformLocked:null,
    updateYPos:false,
    hold:false,
    delta:null,
    update:function(tileMap, player) {
        if (this.hold == false) {
            var winSize = cc.Director.getInstance().getWinSize();

            var posX = player.position.x;

            var posY;
            if (this.isPlatformLockCamera && this.position != null) {
                posY = this.position.y;
            } else {
                posY = player.position.y;
            }

            var x = Math.max(posX, winSize.width / 2);
            var y = Math.max(posY, winSize.height / 2);

            x = Math.min(x, (tileMap.getMapSize().width * tileMap.getTileSize().width) - winSize.width / 2);
            y = Math.min(y, (tileMap.getMapSize().height * tileMap.getTileSize().height) - winSize.height / 2);

            var actualPosition = cc.p(x, y);

            var centerOfView = cc.p(winSize.width / 2, winSize.height / 2);

            var diff = cc.pSub(centerOfView, actualPosition);
            if (this.isPlatformLockCamera) {
                if (this.updateYPos == true) {

                    var tileMapY = cc.p(0, tileMap.getPosition().y);

                    var diffY = cc.p(0, diff.y);

                    var yDiff = cc.pSub(diffY, tileMapY);

                    var action = cc.MoveBy.create(0.4, yDiff);

                    action.setTag(7);

                    tileMap.runAction(action);

                    tileMap.setPosition(cc.p(diff.x, tileMap.getPosition().y));

                    this.updateYPos = false;

                } else {
                    tileMap.setPosition(cc.p(diff.x, tileMap.getPosition().y));
                    if (tileMap.getActionByTag(7) != null) {
                        tileMap.getActionByTag(7)._endPosition.x = diff.x;
                    }
                }
            } else {
                tileMap.setPosition(diff);
            }
        }
    },
    updatePosition: function(point) {
        if (cc.pDistance(this.getPosition(), point) > 64) {
            this.setPosition(point);
            this.updateYPos = true;
        }
    },
    updateHard:function(tileMap, position) {
        var winSize = cc.Director.getInstance().getWinSize();

        var posX = position.x;
        var posY = position.y;

        var x = Math.max(posX, winSize.width / 2);
        var y = Math.max(posY, winSize.height / 2);

        x = Math.min(x, (tileMap.getMapSize().width * tileMap.getTileSize().width) - winSize.width / 2);
        y = Math.min(y, (tileMap.getMapSize().height * tileMap.getTileSize().height) - winSize.height / 2);

        var actualPosition = cc.p(x, y);

        var centerOfView = cc.p(winSize.width / 2, winSize.height / 2);

        var diff = cc.pSub(centerOfView, actualPosition);

        tileMap.setPosition(diff);

    }
});