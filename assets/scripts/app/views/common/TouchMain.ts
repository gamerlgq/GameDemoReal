
import { _decorator, Component, Node, EventTouch, Prefab, instantiate, v3, UITransform, log, Input, input, EventMouse } from 'cc';
import { ResourcesLoader } from '../../../framework/data/ResourcesLoader';
import { v2ToV3 } from '../../../framework/utils/functions';
import { viewRegisterMgr } from '../../define/ViewRegisterMgr';
import { TouchEffect } from './TouchEffect';
const { ccclass, property,disallowMultiple } = _decorator;

/**
 * Predefined variables
 * Name = TouchMain
 * DateTime = Tue Mar 22 2022 19:57:53 GMT+0800 (中国标准时间)
 * Author = maikx123456
 * FileBasename = TouchMain.ts
 * FileBasenameNoExtension = TouchMain
 * URL = db://assets/scripts/app/views/common/TouchMain.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('TouchMain')
@disallowMultiple(true)
export class TouchMain extends Component {
    private _touchEffectNode:Node
    private _touchEffectComp:TouchEffect

    onLoad() {
        
    }
    start() {
        let viewInfo = viewRegisterMgr.getViewInfo("commonUI","TouchEffect")
        ResourcesLoader.loadWithViewInfo(viewInfo, (pre:Prefab)=>{
            this._touchEffectNode = instantiate(pre)
            this.node.addChild(this._touchEffectNode)
            this._touchEffectNode.active = false
            this._touchEffectComp = this._touchEffectNode.getChildByName("ScriptNode").getComponent(TouchEffect)
        },false)
        
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart,this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove,this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd,this)
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel,this)
        // this.node.eventProcessor
        
        // input.on(Input.EventType.MOUSE_UP, this.onTouchEnd, this)
    }

    onTouchEnd(event: EventTouch) {
        event.preventSwallow = true
        
    }

    private onTouchStart(event: EventTouch) {
        event.preventSwallow = true

        if (!this._touchEffectNode) {
            return
        }

        let pos = event.getUILocation()
        let nodePos = this.node.getComponent(UITransform).convertToNodeSpaceAR(v2ToV3(pos))
        this._touchEffectNode.position = nodePos
        this._touchEffectComp.play()
    }
    private onTouchMove(event: EventTouch) {
        event.preventSwallow = true
    }
    private onTouchCancel(event: EventTouch) {
        event.preventSwallow = true
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
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
