
import { _decorator, Component, Node, log } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('CameraLock')
export class CameraLock extends Component {

    private _endCallback:Function = null;

    setEndCallback (endCallback) {
        this._endCallback = endCallback;
    }

    onEndCallback() {
        if (this._endCallback){
            this._endCallback();
            this._endCallback = null;
        }
    }
}
