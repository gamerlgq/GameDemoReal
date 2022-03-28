
import { _decorator, Component, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = TouchEffect
 * DateTime = Tue Mar 22 2022 19:43:46 GMT+0800 (中国标准时间)
 * Author = maikx123456
 * FileBasename = TouchEffect.ts
 * FileBasenameNoExtension = TouchEffect
 * URL = db://assets/scripts/app/views/common/TouchEffect.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('TouchEffect')
export class TouchEffect extends Component {
    private _clip:Animation;

    constructor() {
        super()

    }
    
    onLoad() {
        this._clip = this.node.parent.getComponent(Animation)
        this._clip.on(Animation.EventType.FINISHED, this.onPlayFinish.bind(this))
    }

    start() {
    }
    
    play() {
        this.node.parent.active = true
        this._clip.play("ToucheEffect")
    }

    onPlayFinish() {
        this.node.parent.active = false
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
