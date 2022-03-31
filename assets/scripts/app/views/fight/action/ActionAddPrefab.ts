import { instantiate, log, Node, Prefab, Tween, tween } from "cc";
import { ResourcesLoader } from "../../../../framework/data/ResourcesLoader";;
import { BloodEffect, EffectBase } from "../effect/Effect";
import { FightEvent } from "../event/FightEvent";
import { FightEventDataType } from "../event/FightEventDataType";
import { fightEventMgr } from "../event/FightEventMgr";
import { FightConstant } from "../FightConstant";
import { ActionBase } from "./Action";
import { FightActionData, fightActionMgr } from "./FightActionMgr";


export class ActionAddPrefab extends ActionBase {
    
    /**
     * 
     * @param data FightActionData
     * @returns Tween<Node>
     */
    public add(data:FightActionData):Tween<Node>{
        let animCfg = data.animCfg;
        let url = animCfg.params[0];
        return tween().call(()=>{
            ResourcesLoader.load(url,(prefab:Prefab)=>{
                let node = instantiate(prefab);
                this._customSetting(data,node);
            })
        })
    }

    private _customSetting(data:FightActionData,node:Node,startCallback?:Function,endcallback?:Function){
        let animCfg = data.animCfg;
        let name = animCfg.layer;
        let tar = data.target;
        let com:any = null
        switch (name) {
            case "BLOOD":
                let args:FightEventDataType.Blood_Change = {
                    PrefabNode: node,
                    Data: data
                }
                com = node.getComponent(BloodEffect) as BloodEffect;
                fightEventMgr?.send(new FightEvent(FightConstant.FightEvent.Blood_Change,args))
                break;
            case "ROLE":
                com = node.getComponent(EffectBase) as EffectBase;
                tar.addEffectFront(node);
                break;
        }

        com.setStartCallback(()=>{
            if (startCallback) {
                startCallback();
            }
        })

        com.setEndCallback(()=>{
            if (endcallback) {
                endcallback();
            }
            node.removeFromParent();
            node.destroy();
            node = null;
        });
    }
}