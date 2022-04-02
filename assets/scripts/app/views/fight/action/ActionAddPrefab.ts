import { instantiate, log, Node, Prefab, Tween, tween } from "cc";
import { ResourcesLoader } from "../../../../framework/data/ResourcesLoader";;
import { EffectBase } from "../effect/Effect";
import { FightEvent } from "../event/FightEvent";
import { FightEventDataType } from "../event/FightEventDataType";
import { fightEventMgr } from "../event/FightEventMgr";
import { fightBloodMgr } from "../FightBloodMgr";
import { FightConstant } from "../FightConstant";
import { ActionBase } from "./Action";
import { FightActionData } from "./FightActionMgr";


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
        switch (name) {
            case "ROLE":
                this._setRoleEffect(data,node);
                break;
            case "DIALOG":
                this._setDialog(data,node);
                break;
        }
    }

    // 设置角色身上特效
    private _setRoleEffect(data:FightActionData,node:Node) {
        let tar = data.target;
        // let com = node.getComponent(EffectBase) as EffectBase;
        let config = data.animCfg;
        let addPart = config[2];//添加部位
        if (addPart) {
            switch (addPart) {
                case FightConstant.FightUnitEffectPart.Front:
                    tar.addEffectFront(node);
                    break;
                case FightConstant.FightUnitEffectPart.Head:
                    
                    break;
                case FightConstant.FightUnitEffectPart.Floot:
                    tar.addEffectBack(node);
                    break;
            }
        }else{
            // 默认特效添加在胸前
            tar.addEffectFront(node);
        }

        fightBloodMgr.check(data);
    }

    // 设置对话框
    private _setDialog(data:FightActionData,node:Node) {
        let animCfg = data.animCfg;
        let params:FightEventDataType.Show_Dialog = {
            PrefabNode: node,
            Desc: animCfg.params[1]
        }
        fightEventMgr?.send(new FightEvent(FightConstant.FightEvent.Show_Dialog,params))
    }

    // EffectBase 组件有两个 callback 可以设置
    private _setCallbacks<T extends EffectBase>(com:T,startCallback?:Function,endCallback?:Function) {
        com.setStartCallback(()=>{
            if (startCallback) {
                startCallback();
            }
        })

        com.setEndCallback(()=>{
            if (endCallback) {
                endCallback();
            }
        });
    }
}