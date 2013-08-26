/**
 * Created with JetBrains WebStorm.
 * User: kylereczek
 * Date: 2013-08-26
 * Time: 9:04 AM
 * To change this template use File | Settings | File Templates.
 */

var EndScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var layer = new EndLayer();
        layer.init();

        this.addChild(layer);

        cc.AudioEngine.getInstance().playMusic("/res/ludum_dare_win_song.mp3", true);
    }
});


var EndLayer = cc.Layer.extend({

    init:function () {

        var title = new cc.Sprite();
        title.initWithFile("/res/win.png");
        title.setPosition(cc.p(cc.Director.getInstance().getWinSize().width / 2, cc.Director.getInstance().getWinSize().height/2));
        title.getTexture().setAliasTexParameters()

        this.addChild(title, 12);
        this.setPosition(cc.p(0, 0));

        this.setKeyboardEnabled(true);

        this.schedule(this.changeScene,1,0,10);

    },
    onKeyDown:function (e) {
        Keys[e] = true;
    },
    onKeyUp:function (e) {
        Keys[e] = false;
    },
    update:function (delta) {
        if (Keys[cc.KEY.enter]) {
            this.changeScene();
        }
    },
    changeScene:function () {
        this.unschedule(this.changeScene);
        cc.Director.getInstance().pushScene(new IntroScene());
    }

});


