import { Singleton } from "../../../framework/components/Singleton";
import { FightActionData } from "./action/FightActionMgr";
import { FightEvent } from "./event/FightEvent";
import { FightEventDataType } from "./event/FightEventDataType";
import { fightEventMgr } from "./event/FightEventMgr";
import { FightConstant } from "./FightConstant";
import { FightMainLayer } from "./FightMainLayer";
import { FightMainWorld } from "./FightMainWorld";

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

    }

    /**
     * check
     */
    public check(data:FightActionData) {
        let result = data.result;
        let resultActionId = result[0];
        if (resultActionId == FightConstant.FightReultAction.Action_HP) {
            this._sendEvent(data);
        }
    }

    private _sendEvent(data:FightActionData) {
        let args:FightEventDataType.Blood_Change = {
            Data: data
        }
        fightEventMgr?.send(new FightEvent(FightConstant.FightEvent.Blood_Change,args));
    }

    public destory(){
        FightBloodMgr.destoryInstance();
    }

    public clear(){
        fightBloodMgr = null;
    }
}