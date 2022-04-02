import { log } from "cc";
import { Singleton } from "../../../framework/components/Singleton";
import { FightEvent } from "./event/FightEvent";
import { FightEventDataType } from "./event/FightEventDataType";
import { fightEventMgr } from "./event/FightEventMgr";
import { FightConstant } from "./FightConstant";

export let fightPlayer:FightPlayer = null;
/**
 * @description 播放器 
 * */
export class FightPlayer extends Singleton{

    public static init(){
        fightPlayer = FightPlayer.getInstance<FightPlayer>();
        fightPlayer._init();
    }

    private _init() {
        this._initListeners();
    }

    private _initListeners() {
        fightEventMgr.addEventListener(FightConstant.FightEvent.Action_Star,this._onActionStart.bind(this));
    }

    // 行动开始
    private _onActionStart(event:FightEvent) {
        let data:FightEventDataType.Action_Start = event.getEventData();
        let action = data.Action;
        let actionData = data.ActionData;
        this._prase(action,actionData);
    }

    // 解析行动
    private _prase(action:number,data:any) {
        //data[[谁],[攻击描述],[结果描述]]
        let who = data[0];
        let attack = data[1];
        let result = data[2];
        let args:FightEventDataType.Action_Data = {
            Who: who,
            Attack: attack,
            Result: result
        }
        fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Attack_Start,args));
        fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Result_Start,args));
    }

    // 重播
    public replay(){
        fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Game_Replay,null))
    }

    // 暂停
    public pause(){
        fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Game_Pause,null))
    }

    // 继续
    public resume(){
        fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Game_Resume,null))
    }

    // 直接结束游戏
    public skip(){
        fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Game_End,null))
    }

    public destory(){
        FightPlayer.destoryInstance();
    }

    public clear(){
        fightPlayer = null;
    }
}