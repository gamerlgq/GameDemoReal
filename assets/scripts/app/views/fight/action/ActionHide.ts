import { log, Node, Tween, tween, Vec3 } from "cc";
import { ActionBase } from "./ActionBase";
import { FightActionData } from "./FightActionMgr";

export class ActionHide extends ActionBase {
    
 
    public hide(duration:number):Tween<Node> {
        return tween().to(duration,{
            Opactiy:0
        }).call(()=>{
            this.done();
        });     
    }
}