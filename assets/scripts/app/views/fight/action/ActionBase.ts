import { FightEvent } from "../event/FightEvent";
import { fightEventMgr } from "../event/FightEventMgr";
import { FightConstant } from "../FightConstant";

interface IAction {
    setDoneCallback(callback:Function):void;
    done():void;
    clean():void;
}

/**
 * @description aciton的基类
 */
export class ActionBase implements IAction{
    private _doneCallback:Function = null;

    setDoneCallback(callback: Function): void {
        this._doneCallback = callback;
    }
     
    // 做一些回调工作
    done(){
        if (this._doneCallback) {
            this._doneCallback()
        }       
        this._send();
        this.clean();
    }

    private _send() {
        fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Single_Action_Done,null));
    }

    // 做一些清理工作
    clean(){
        this._doneCallback = null;
    }
}