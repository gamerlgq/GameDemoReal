import { log, Node, Tween, tween, Vec3 } from "cc";
import { ActionBase } from "./ActionBase";
import { FightActionData } from "./FightActionMgr";

export class ActionShow extends ActionBase {
    
 
    public show(duration:number):Tween<Node> {
        return tween().to(duration,{
            Opacity:255
        }).call(()=>{
            this.done();
        });     
    }
}