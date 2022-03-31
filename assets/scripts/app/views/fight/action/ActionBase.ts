
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
        this.clean();
    }

    // 做一些清理工作
    clean(){
        this._doneCallback = null;
    }
}