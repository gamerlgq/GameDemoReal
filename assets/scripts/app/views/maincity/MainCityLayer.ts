
import { _decorator, Component, Node, find, log, EventTouch, v3, Vec3, Vec2, tween, Tween, easing, v2 } from 'cc';
import { audioMgr } from '../../../framework/core/audio/AudioManager';
import { sceneMgr } from '../../../framework/core/SceneMgr';
import { DInertiaMove } from '../../../framework/ui/DInertiaMove';
import { LayerBase } from '../../../framework/ui/LayerBase';
import { MulitMoveingBgs } from '../../../framework/ui/MulitMoveingBgs';
import { sceneTriggerMgr } from '../../../framework/utils/SceneTriggerMgr';
import { viewRegisterMgr, ViewRegisterMgr } from '../../define/ViewRegisterMgr';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = MainCityLayer
 * DateTime = Tue Mar 08 2022 14:26:57 GMT+0800 (中国标准时间)
 * Author = Steven_Greeard
 * FileBasename = MainCityLayer.ts
 * FileBasenameNoExtension = MainCityLayer
 * URL = db://assets/scripts/app/views/maincity/MainCityLayer.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('MainCityLayer')
export class MainCityLayer extends LayerBase {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    @property(MulitMoveingBgs)
    mulitBgComp:MulitMoveingBgs

    @property(Node)
    mainCityLayer:Node

    _deltaPos:Vec2;
    _bgDInertiaMove:DInertiaMove


    onLoad(){
        //触发器写在onLoad，否则切换刚加入主场景的时候，start还没开始执行
        sceneTriggerMgr.addTriggrt(viewRegisterMgr.getViewInfo("maincity", "MainCityLayer").System, this.onTrigger.bind(this),1)

    }
    
    start () {
        // [3]
        audioMgr.playMusic("maincity/avs/bgm_liyuan")
        this._initBgTouch()

        //全局事件监听
        sceneMgr.addMainEventTrigger()
    }

    private onTrigger() {
        log("main city trigger")
    }

    private _initBgTouch() {
        this.mainCityLayer.on(Node.EventType.TOUCH_START, this.onBgTouchStart.bind(this))
        this.mainCityLayer.on(Node.EventType.TOUCH_MOVE, this.onBgTouchMove.bind(this))
        this.mainCityLayer.on(Node.EventType.TOUCH_END, this.onBgTouchEnd.bind(this))
    }

    private onBgTouchStart() {
        this._deltaPos = null
        this.mulitBgComp.stop()
    }

    private onBgTouchMove(event:EventTouch) {
        this._deltaPos = event.getDelta()
        this._deltaPos.multiplyScalar(1.5)
        this._deltaPos = v2(this._deltaPos.x, 0)
        this.mulitBgComp.move(this._deltaPos, false)
    }
    
    private onBgTouchEnd() {
        if (!this._deltaPos) {
            return
        }
        this.mulitBgComp.move(this._deltaPos, true)
    }

    update (deltaTime: number) {
        // [4]
        
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
