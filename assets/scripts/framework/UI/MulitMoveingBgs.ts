
import { _decorator, Component, Node, CCInteger, Prefab, v3, tween, Vec3, Vec2, log, CCFloat } from 'cc';
import { posAdd, v2ToV3, v3ToV2 } from '../utils/functions';
import { DInertiaMove } from './DInertiaMove';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = MulitMoveingBgs
 * DateTime = Mon Mar 14 2022 17:34:40 GMT+0800 (中国标准时间)
 * Author = maikx123456
 * FileBasename = MulitMoveingBgs.ts
 * FileBasenameNoExtension = MulitMoveingBgs
 * URL = db://assets/scripts/app/views/common/MulitMoveingBgs.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('BgTarget')
class BgTarget{
    @property(Node)
    bgNode: Node;
    @property(CCFloat)
    moveScale: number;
}

@ccclass('MulitMoveingBgs')
export class MulitMoveingBgs extends Component {
    @property({ type: [BgTarget] })
    private subBg: BgTarget[] = [];

    @property(Node)
    private mainBg: Node;
    @property(CCFloat)
    private minX: number = 0;
    @property(CCFloat)
    private maxX: number = 0;

    start() {
        this.mainBg.addComponent(DInertiaMove).onPosChange = this.onMainBgChangePos.bind(this)
    }

    private onMainBgChangePos(insreasedPos:Vec3) {
        this.subBg.forEach(element => {
            let subMovePos = insreasedPos.clone().multiplyScalar(element.moveScale)
            posAdd(element.bgNode, v3ToV2(subMovePos))
        });
    }


    move(byPos: Vec2, isDInertia: boolean) {
        // 惯性移动
        if (isDInertia) {
            let dInertiaMoveComp = this.mainBg.getComponent(DInertiaMove)
            dInertiaMoveComp.move(byPos, this.minX, this.maxX)
        }
        else {
            // 非惯性移动
             //判断结束
             let newPos = this.mainBg.position.clone().add(v3(byPos.x, byPos.y))
             if (this.minX && newPos.x < this.minX) {
                newPos.x = this.minX
            }
            if (this.maxX && newPos.x > this.maxX) {
                newPos.x = this.maxX
            }

            let insreasedPos = newPos.subtract(this.mainBg.position)
            let dis =  insreasedPos.length()
            if (dis !=0 ) {
                posAdd(this.mainBg, byPos, this.minX, this.maxX)
                this.onMainBgChangePos(insreasedPos)
            }

        }
    }

    stop() {
        this.mainBg.addComponent(DInertiaMove).stop()
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
