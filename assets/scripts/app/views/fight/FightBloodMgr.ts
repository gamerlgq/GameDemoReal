import { log, Vec3 } from "cc";
import { Singleton } from "../../../framework/components/Singleton";
import { FightActionData, fightActionMgr } from "./action/FightActionMgr";
import { BloodEffect } from "./effect/BloodEffect";
import { FightEvent } from "./event/FightEvent";
import { FightEventDataType } from "./event/FightEventDataType";
import { fightEventMgr } from "./event/FightEventMgr";
import { FightConstant } from "./FightConstant";
import { FightMainLayer } from "./FightMainLayer";
import { FightMainWorld } from "./FightMainWorld";
import { BloodLayer } from "./layer/BloodLayer";
import { RoleLayer } from "./layer/RoleLayer";

export let fightBloodMgr:FightBloodMgr = null;
export class FightBloodMgr extends Singleton {
    
    private _fightMainLayer:FightMainLayer = null;

    private _fightMainWorld:FightMainWorld = null;

    /**
     * init
     */
     public static init(mainLayer:FightMainLayer) {
        fightBloodMgr = FightBloodMgr.getInstance<FightBloodMgr>();
        fightBloodMgr._init(mainLayer);
    }

    private _init(mainLayer:FightMainLayer) {
        this._fightMainLayer = mainLayer;
        this._fightMainWorld = this._fightMainLayer.getFightMainWorld();
        this._initListeners();
    }

    private _initListeners() {
        fightEventMgr.addEventListener(FightConstant.FightEvent.Blood_Change,this._onBloodChange.bind(this));
    }

    private _onBloodChange(event:FightEvent) {
        if (!this._fightMainWorld){
            this._fightMainWorld = this._fightMainLayer.getFightMainWorld();
        }
        let data:FightEventDataType.Blood_Change = event.getEventData();
        this._showBloodChange(data);
    }

    private _showBloodChange(fightEventData:FightEventDataType.Blood_Change) {
        let prefabNode = fightEventData.PrefabNode;
        let data = fightEventData.Data;
        let bloodLayer = fightActionMgr.getCommonentInLayer(FightConstant.FightLayer.BLOOD,BloodLayer);

        let result = data.result;
        let bloodType = result[0];
        let num = result[1];

        let com = prefabNode.getComponent(BloodEffect);
        com.setType(bloodType);
        com.setNumber(num);

        let animCfg = data.animCfg;
        let params = animCfg.params;
        let tar = data.target;
        let roleLayer = this._fightMainWorld.getCommonentInLayer(FightConstant.FightLayer.ROLE,RoleLayer);
        let pos = roleLayer.getFomationPos(tar.camp,tar.formationIndex);
        pos = pos.add(new Vec3(...params[1]));
        prefabNode.position = pos;
        bloodLayer.show(prefabNode);
    }

    // /**
    //  * 
    //  */
    // public check(data:FightActionData) {
    //     log(data,"check");
    // }

    public destory(){
        FightBloodMgr.destoryInstance();
    }

    public clear(){
        fightBloodMgr = null;
    }
}