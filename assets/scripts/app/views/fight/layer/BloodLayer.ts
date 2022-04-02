import { instantiate, log, Node, Prefab, Vec3 } from "cc";
import { ResourcesLoader } from "../../../../framework/data/ResourcesLoader";
import { FightActionData, fightActionMgr } from "../action/FightActionMgr";
import { BloodEffect } from "../effect/Effect";
import { FightEvent } from "../event/FightEvent";
import { FightEventDataType } from "../event/FightEventDataType";
import { fightEventMgr } from "../event/FightEventMgr";
import { FightConstant } from "../FightConstant";
import { FightLayerBase } from "./FightLayerBase";
import { RoleLayer } from "./RoleLayer";


const Blood_Number_Prefab_Path = {
    [FightConstant.FightHPAction.Action_HP_Damage]:"fight/prefabs/effect/numbers",
    [FightConstant.FightHPAction.Action_HP_Cure]:"fight/prefabs/effect/numbers",
    [FightConstant.FightHPAction.Action_HP_Crit]:"fight/prefabs/effect/numbers",
    [FightConstant.FightHPAction.Action_HP_Absort]:"fight/prefabs/effect/numbers"
}


const Blood_Number_Offest = new Vec3(0,250,0);

export class BloodLayer extends FightLayerBase {
   
    public init(){
        this._initListeners();
    }

    private _initListeners() {
        fightEventMgr.addEventListener(FightConstant.FightEvent.Blood_Change,this._onBloodChange.bind(this));
    }

    private _onBloodChange(event:FightEvent) {
        let data:FightEventDataType.Blood_Change = event.getEventData();
        this._showBloodChange(data);
    }

    private async _showBloodChange(fightEventData:FightEventDataType.Blood_Change) {
        let data = fightEventData.Data;
        let result = data.result;
        let bloodType = result[1] || FightConstant.FightHPAction.Action_HP_Damage;

        // load prefab
        let path = Blood_Number_Prefab_Path[bloodType]
        let prefab:Prefab = await ResourcesLoader.loadPromise(path,Prefab);
        let prefabNode:Node = instantiate(prefab);
        this.node.addChild(prefabNode);
        // set prefab node position
        let tar = data.target;
        let roleLayer = fightActionMgr.getCommonentInLayer(FightConstant.FightLayer.ROLE,RoleLayer);
        let pos = roleLayer.getFomationPos(tar.camp,tar.formationIndex);
        pos = pos.add(Blood_Number_Offest);
        prefabNode.position = pos;

        // set blood info
        let num = result[4]
        let com = prefabNode.getComponent(BloodEffect);
        com.setType(bloodType);
        com.setNumber(num);        
        com.show();
    }
}