import { log, Node, Tween, tween, Vec3 } from "cc";
import { ActionBase } from "./ActionBase";
import { FightActionData } from "./FightActionMgr";

export class ActionMove extends ActionBase {
    
    private _middlePos:Vec3 = new Vec3();
    private _offset:Vec3 = new Vec3(140,0,0);
    /**
     * 
     * @param own 移动节点
     * @param pos 目标位置
     * @param duration 持续时间
     */
    public move(data:FightActionData):Tween<Node> {

        let own = data.own;
        let config = data.animCfg;
        let params = config.params;
        let pos:Vec3 = params[0];
        let duration:number = params[1];
        this._middlePos.x = 0;
        this._middlePos.y = pos.y+80;
        this._middlePos.z = 0;
        return tween().to(duration/2,{
            position:this._middlePos
        },{
            progress:(start,end,current,ratio)=>{
                return start + (end - start) * ratio;
            }
        }).to(duration/2,{
            position:pos.subtract(this._offset)
        },{
            progress:(start,end,current,ratio)=>{
                return start + (end - start) * ratio;
            }
        })
        
    }
}