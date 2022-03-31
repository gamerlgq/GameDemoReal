import { log, Node, Tween, tween, TweenAction, Vec3 } from "cc";
import { HeroSpineNode, MonsterSpineNode, SpineNodeBase } from "../../common/spine/SpineNodeBase";
import { FightConstant } from "../FightConstant";
import { ActionBase } from "./ActionBase";
import { FightActionData, fightActionMgr } from "./FightActionMgr";

export class AcitonJump extends ActionBase {
    
    /**
     * 
     * @param data FightActionData
     * @param callback 可选,回调函数
     * @returns Tween<Node>
     */
    public jump(data:FightActionData,callback?:Function):Tween<Node> {

        this.setDoneCallback(callback);

        let own = data.own;
        let config = data.animCfg;
        let params = config.params;
        let duration:number= params[0];
        let offset:Array<number> = params[1];
        
        let tar = data.target;
        let tarPos = this._getTargetPos(tar);
        let _middlePos = this._getMiddlePos(tarPos);
        let _scale = this._getScale(own);
        let _endPos = this._getEndPos(own,tarPos,new Vec3(...offset));

        return tween().parallel(
            tween().to(duration/2,{
                    position:_middlePos
                },{
                    progress:(start,end,current,ratio)=>{
                        return start + (end - start) * ratio;
                    }
                }).to(duration/2,{
                    position:_endPos
                },{
                    progress:(start,end,current,ratio)=>{
                        return start + (end - start) * ratio;
                    }
                }),
            tween().call(()=>{
                own.setSiblingIndex(10);
                own.play("jump");
            }),
            tween().to(duration,{
                scale:_scale
            })
        ).call(()=>{
            this.done();
        })
    }

    private _getTargetPos(tar:HeroSpineNode|MonsterSpineNode):Vec3 {
        return fightActionMgr.getUnitPos([tar.camp,tar.formationIndex]);
    }

    private _getMiddlePos(tarPos:Vec3):Vec3 {
        let _middlePos:Vec3 = new Vec3();
        _middlePos.y = tarPos.y+80;
        return _middlePos
    }

    private _getScale(own:HeroSpineNode|MonsterSpineNode):Vec3 {
        if (own.camp == FightConstant.FightUnitType.Attack){
            return new Vec3(1.08,1.08,1)
        }else if (own.camp == FightConstant.FightUnitType.Defend){
            return new Vec3(-1.08,1.08,1)
        }
    }

    private _getEndPos(own:HeroSpineNode|MonsterSpineNode,tarPos:Vec3,offset:Vec3) {
        if (own.camp == FightConstant.FightUnitType.Attack){
            return tarPos.subtract(offset)
        }else if (own.camp == FightConstant.FightUnitType.Defend){
            return tarPos.add(offset)
        }
    }
}