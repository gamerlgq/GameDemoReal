
import { _decorator, Component, Node, Vec3, tween, Vec2, v3, v2, log } from 'cc';
import { posAdd } from '../utils/functions';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = DInertiaMove
 * DateTime = Tue Mar 15 2022 11:02:34 GMT+0800 (中国标准时间)
 * Author = maikx123456
 * FileBasename = DInertiaMove.ts
 * FileBasenameNoExtension = DInertiaMove
 * URL = db://assets/scripts/framework/ui/DInertiaMove.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 惯性移动组件
 */

@ccclass('DInertiaMove')
export class DInertiaMove extends Component {

    private _autoOffPos: Vec2; //每一帧的偏移值
    private drag: number = 0.97; //摩擦系数
    private isAutoScrolling: boolean = false;
    private _minX: number;
    private _maxX: number;

    private _onStop: Function;
    public get onStop(): Function {
        return this._onStop;
    }
    public set onStop(value: Function) {
        this._onStop = value;
    }

    private _increasedPos: Vec3; //每一帧增加的向量

    public onPosChange:Function;

    start() {
    }
    
    move(byPos: Vec2, minX?: number, maxX?: number) {
        this._autoOffPos = byPos
        this.isAutoScrolling = true
        this._minX = minX
        this._maxX = maxX
    }

    stop() {
        this.isAutoScrolling = false
        this._autoOffPos = v2(0, 0)
        this.onStop && this.onStop()
    }

    update(deltaTime: number) {
        if (this.isAutoScrolling) {
            this._autoOffPos = this._autoOffPos.multiplyScalar(this.drag)

            //判断结束
            let newPos = this.node.position.clone().add(v3(this._autoOffPos.x, this._autoOffPos.y))
            if (this._minX && newPos.x < this._minX) {
                newPos.x = this._minX
            }
            if (this._maxX && newPos.x > this._maxX) {
                newPos.x = this._maxX
            }

            this._increasedPos = newPos.subtract(this.node.position)
            let dis =  this._increasedPos.length()
            if (dis < 2)
                this.stop()
            else{
                posAdd(this.node, this._autoOffPos, this._minX, this._maxX)
                this.onPosChange && this.onPosChange(this._increasedPos)
            }
        }
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
