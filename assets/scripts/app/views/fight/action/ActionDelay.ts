import { Node, Tween, tween } from "cc";
import { ActionBase } from "./ActionBase";
import { FightActionData } from "./FightActionMgr";

export class ActionDelay extends ActionBase {
    
    /**
     * 
     * @param own 移动节点
     * @param duration 持续时间
     */
    public delay(data:FightActionData):Tween<Node> {
        let animCfg = data.animCfg;
        let param = animCfg.params;
        let duration:number = param[0];
        return tween().delay(duration);
    }
}