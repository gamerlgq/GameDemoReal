import { log, Node, sp, Tween, tween } from "cc";
import { yy } from "../../../define/YYNamespace";
import { fightBloodMgr } from "../FightBloodMgr";
import { ActionBase } from "./ActionBase";
import { FightActionData } from "./FightActionMgr";

export class ActionSpineAnim extends ActionBase{

    private _callback:yy.interfaces.SpineTrackEntryCallFunc = null;

    /**
     * 
     * @param data FightActionData
     * @param actionName 
     * @param callback 
     * @param isLoop 
     */
    play(data:FightActionData,callback?:yy.interfaces.SpineTrackEntryCallFunc):Tween<Node>{
        let node = data.own;
        let config = data.animCfg;
        let params = config.params
        let actionName = params[0];
        let isLoop = params[1];
        this._callback = callback;
        node.setAnimateEndCallback(this._done.bind(this));
        // this._checkBloodChange(actionName,data); 
        return tween(node).call(()=>{
            node.play(actionName,isLoop);
        });
    }    

    // private _checkBloodChange(actionName:string,data:FightActionData) {
    //     if (actionName == yy.macro.HeroAnimate.Hurt) {
    //         // fightBloodMgr.check(data);
    //     }
    // }

    private _done(trackEntry:sp.spine.TrackEntry) {
        if (this._callback){
            this._callback(trackEntry);
        }
        this.done();
    }

    done(): void {
        
    }
}