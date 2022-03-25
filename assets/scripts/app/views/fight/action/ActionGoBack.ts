import { log, Node, Tween, tween, Vec3 } from "cc";
import { HeroSpineNode, MonsterSpineNode } from "../../common/spine/SpineNodeBase";
import { FightConstant } from "../FightConstant";
import { ActionBase } from "./ActionBase";
import { FightActionData, fightActionMgr } from "./FightActionMgr";

export class ActionGoBack extends ActionBase {
    
    /**
     * 
     * @param own 移动节点
     * @param pos 阵型孔位置
     * @param duration 持续时间
     */
    public goBack(data:FightActionData):Tween<Node> {
        let own = data.own;
        let pos:Vec3 = fightActionMgr.getUnitPos([own.camp,own.formationIndex]);
        let config = data.animCfg;
        let params = config.params;
        let duration:number = params[0]
        let _scale = this._getScale(own);
        return tween().parallel(
            tween().to(duration,{
                position:pos
            },{
                progress:(start,end,current,ratio)=>{
                    return start + (end - start) * ratio;
                }
            }),
            tween().to(duration,{
                scale:_scale
            }),
            tween().call(()=>{
                own.setSiblingIndex(own.formationIndex);
            })
        )    
    }


    private _getScale(own:HeroSpineNode|MonsterSpineNode):Vec3 {
        if (own.camp == FightConstant.FightUnitType.Attack){
            return new Vec3(1,1,1)
        }else if (own.camp == FightConstant.FightUnitType.Defend){
            return new Vec3(-1,1,1)
        }
    }
}