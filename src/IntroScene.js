/**
 * Created with JetBrains WebStorm.
 * User: kylereczek
 * Date: 2013-08-26
 * Time: 9:04 AM
 * To change this template use File | Settings | File Templates.
 */
var IntroLayer = cc.Layer.extend({

    init:function () {

        var title = new cc.Sprite();
        title.initWithFile("/res/title.png");
        title.setPosition(cc.p(cc.Director.getInstance().getWinSize().width / 2, cc.Director.getInstance().getWinSize().height/2 + 50));
        title.setScaleX(2);
        title.setScaleY(2);

        var title2 = new cc.Sprite();
        title2.initWithFile("/res/title_2.png");
        title2.setPosition(cc.p(cc.Director.getInstance().getWinSize().width / 2, cc.Director.getInstance().getWinSize().height/2 - 100));
        title2.setScaleX(2);
        title2.setScaleY(2);

        this.addChild(title, 12);
        this.addChild(title2, 12);

        this.setPosition(cc.p(0, 0));

        this.setKeyboardEnabled(true);

        this.scheduleUpdate();
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
        cc.Director.getInstance().pushScene(new HelloWorldScene());
    }

});


var IntroScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var layer = new IntroLayer();
        layer.init();

        this.addChild(layer);

        cc.AudioEngine.getInstance().playMusic("/res/intro.mp3", true);
    }
});
