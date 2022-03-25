import { log, Node, Vec3 } from "cc";
import { FightActionData } from "../action/FightActionMgr";
import { BloodEffect } from "../effect/Effect";
import { FightLayerBase } from "./FightLayerBase";

export class BloodLayer extends FightLayerBase {
   
    public init(){
        
    }

    /**
     * 
     * @param effect 特效的节点
     */
    public show(effect:Node) {
        this.node.addChild(effect);
        let com = effect.getComponent(BloodEffect);
        com.show();
    }
}