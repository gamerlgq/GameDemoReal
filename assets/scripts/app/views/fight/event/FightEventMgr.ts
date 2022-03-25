/*
 * @Author: liuguoqing
 * @Date: 2022-03-19 11:17:19
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-20 23:03:19
 * @Description: file content
 */
import { log } from "cc";
import { Singleton } from "../../../../framework/components/Singleton";
import { FightConstant } from "../FightConstant";
import { FightEvent } from "./FightEvent";

interface FightEventHandler{
    (event:FightEvent):void
}

export let fightEventMgr:FightEventMgr = null;

export class FightEventMgr extends Singleton{

    private _eventHandlers:Map<number,Array<FightEventHandler>>=null;
    
    /**
     * init
     */
    public static init() {
        fightEventMgr = FightEventMgr.getInstance<FightEventMgr>();
        fightEventMgr._init();
    }

    private _init(){
        this._eventHandlers = new Map<number,Array<FightEventHandler>>();
    }
     
    public addEventListener(eventId:number,handler:FightEventHandler){
        let handlerQueue = this._eventHandlers.get(eventId);
        if (!handlerQueue) {
            handlerQueue = new Array<FightEventHandler>();
            this._eventHandlers.set(eventId,handlerQueue);
        }
        handlerQueue.push(handler);
    }

    public removeEventListener(eventId:number,handler:FightEventHandler){
        let handlerQueue = this._eventHandlers.get(eventId);
        if (handlerQueue) {
            let idx = handlerQueue.indexOf(handler);
            if (idx != -1){
                handlerQueue.splice(idx);
            }
        }
    }

    public send(event:FightEvent){
        log("[Debug][FightEvent:]",this._getEventName(event.getEventId()),"=====>",event.getEventData());
        this._dispatchEvent(event);
    }

    private _getEventName(eventId) {
        switch (eventId) {
            case FightConstant.FightEvent.Game_Star:
                return "Game_Star";
            case FightConstant.FightEvent.Game_End:
                return "Game_End";
            case FightConstant.FightEvent.Game_Pause:
                return "Game_Pause";
            case FightConstant.FightEvent.Game_Resume:
                return "Game_Resume";
            case FightConstant.FightEvent.Game_Replay:
                return "Game_Replay";
            case FightConstant.FightEvent.Round_Start:
                return "Round_Start";
            case FightConstant.FightEvent.Round_End:
                return "Round_End";
            case FightConstant.FightEvent.Action_Star:
                return "Action_Star";
            case FightConstant.FightEvent.Action_End:
                return "Action_End";
            case FightConstant.FightEvent.Attack_Start:
                return "Attack_Start";
            case FightConstant.FightEvent.Attack_End:
                    return "Attack_End";
            case FightConstant.FightEvent.Result_Start:
                return "Result_Start";
            case FightConstant.FightEvent.Result_End:
                return "Result_End";
            case FightConstant.FightEvent.Blood_Change:
                return "Blood_Change";
        }
    }

    private _dispatchEvent(event:FightEvent){
        let eventId = event.getEventId();
        let handlerQueue = this._eventHandlers.get(eventId);
        if (handlerQueue) {
            handlerQueue.forEach((handler)=>{
                if (handler) {
                    handler(event);
                }
            })
        }
    }

    public destory(){
        FightEventMgr.destoryInstance();
    }

    public clear(){
        fightEventMgr = null;
    }
}