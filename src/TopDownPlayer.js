//noinspection JSValidateTypes
var TopDownPlayer = cc.Node.extend({
    id:null,
    sprite:null,
    speed:220,
    jumpTimer:null,
    velocity:null,
    desiredPosition:null,
    isOnGround:null,
    init:function () {
        this.sprite = cc.Sprite.create("/resources/player.png");
        this.sprite.position = this.position;
        this.sprite.setAnchorPoint(cc.ccp(0, 0));

        this.velocity = cc.ccp();

        return this;
    },
    update:function (delta) {

        var xMove = cc.ccp(950, 0);
        var forwardStep = cc.ccpMult(xMove, delta);

        var yMove = cc.ccp(0, 950);
        var upStep = cc.ccpMult(yMove, delta);

        this.velocity = cc.ccp(this.velocity.x * 0.93, this.velocity.y * 0.93);

        if ((Keys[cc.KEY.w] || Keys[cc.KEY.up])) {
            this.velocity = cc.ccpAdd(this.velocity, upStep);
        }

        if ((Keys[cc.KEY.s] || Keys[cc.KEY.down])) {
            this.velocity = cc.ccpSub(this.velocity, upStep);
        }

        if ((Keys[cc.KEY.a] || Keys[cc.KEY.left])) {
            this.velocity = cc.ccpSub(this.velocity, forwardStep);
        }

        if ((Keys[cc.KEY.t])) {
            player.position = cc.ccp(cc.sharedDirector._winSizeInPixels.width/2,cc.sharedDirector._winSizeInPixels.height/2);
        }

        if ((Keys[cc.KEY.d] || Keys[cc.KEY.right])) {
            this.velocity = cc.ccpAdd(this.velocity, forwardStep);
        }

        var minMovement = cc.ccp(-850, -850);
        var maxMovement = cc.ccp(850, 850);

        this.velocity = cc.ccpClamp(this.velocity, minMovement, maxMovement);

        var stepVelocity = cc.ccpMult(this.velocity, delta);

        this.desiredPosition = cc.ccpAdd(this.position, stepVelocity);

        this.sprite.setPosition(this.position);

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

                var intersection = cc.Rect.CCRectIntersection(rect, collisionRect);

                if (intersection.size.width < intersection.size.height) {
                    if (intersection.origin.x > this.desiredPosition.x) {
                        this.desiredPosition = cc.ccp(this.desiredPosition.x - intersection.size.width, this.desiredPosition.y);
                        this.velocity = cc.ccp(0, this.velocity.y);
                    } else {
                        this.desiredPosition = cc.ccp(this.desiredPosition.x + intersection.size.width, this.desiredPosition.y);
                        this.velocity = cc.ccp(0, this.velocity.y);
                    }
                } else if (intersection.size.width > intersection.size.height) {
                    if (intersection.origin.y > this.desiredPosition.y) {
                        this.desiredPosition = cc.ccp(this.desiredPosition.x, this.desiredPosition.y - intersection.size.height);
                        this.velocity = cc.ccp(this.velocity.x, 0);
                    } else if (intersection.origin.y == this.desiredPosition.y) {
                        this.desiredPosition = cc.ccp(this.desiredPosition.x, this.desiredPosition.y + intersection.size.height);
                        this.velocity = cc.ccp(this.velocity.x, 0);
                        this.isOnGround = true;
                    }
                }

            }
        }

        this.position = cc.ccp(this.desiredPosition.x, this.desiredPosition.y);
    }


});