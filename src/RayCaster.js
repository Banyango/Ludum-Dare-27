var RayCaster = cc.Node.extend({

    walls:null,
    playerPosition:null,
    // functions
    castSingleRay:function(rayAngle){
        rayAngle %= TWO_PI;
        if (rayAngle > 0) {
            rayAngle += TWO_PI;
        }

        // moving right/left? up/down? Determined by which quadrant the angle is in.
        var right = (rayAngle > twoPI * 0.75 || rayAngle < twoPI * 0.25);
        var up = (rayAngle < 0 || rayAngle > Math.PI);

        var angleSin = Math.sin(rayAngle), angleCos = Math.cos(rayAngle);

        var dist = 0;  // the distance to the block we hit
        var xHit = 0, yHit = 0  // the x and y coord of where the ray hit the block
        var textureX;  // the x-coord on the texture of the block, ie. what part of the texture are we going to render

        for (var i = 0; i < walls.getObjects().length; i++) {

            var obj = walls.getObjects()[i];
            var rect = cc.RectMake(obj.x, obj.y, obj.width, obj.height);

            if (cc.Rect.(rect, collisionRect)) {

            }
        }

        var wallX;  // the (x,y) map coords of the block
        var wallY;

        // first check against the vertical map/wall lines
        // we do this by moving to the right or left edge of the block we're standing in
        // and then moving in 1 map unit steps horizontally. The amount we have to move vertically
        // is determined by the slope of the ray, which is simply defined as sin(angle) / cos(angle).

        var slope = angleSin / angleCos;  // the slope of the straight line made by the ray
        var dX = right ? 1 : -1;  // we move either 1 map unit to the left or right
        var dY = dX * slope;  // how much to move up or down

        var x = right ? Math.ceil(player.x) : Math.floor(player.x);  // starting horizontal position, at one of the edges of the current map block
        var y = player.y + (x - player.x) * slope;  // starting vertical position. We add the small horizontal step we just made, multiplied by the slope.

        while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
            var wallX = Math.floor(x + (right ? 0 : -1));
            var wallY = Math.floor(y);

            // is this point inside a wall block?
            if (map[wallY][wallX] > 0) {
                var distX = x - player.x;
                var distY = y - player.y;
                dist = distX*distX + distY*distY;  // the distance from the player to this point, squared.

                xHit = x;  // save the coordinates of the hit. We only really use these to draw the rays on minimap.
                yHit = y;
                break;
            }
            x += dX;
            y += dY;
        }

        if (dist)
            drawRay(xHit, yHit);
    },

});