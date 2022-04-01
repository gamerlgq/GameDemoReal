
import { Animation, Label, log, ProgressBar, _decorator } from 'cc';
import { runInThisContext } from 'vm';
import { sceneMgr } from '../../../framework/core/SceneMgr';
import { ResourcesLoader } from '../../../framework/data/ResourcesLoader';
import { LayerBase } from '../../../framework/ui/LayerBase';
const { ccclass, property } = _decorator;
 
@ccclass('TransLoadingLayer')
export class TransLoadingLayer extends LayerBase {
    
    @property(Label)
    percent: Label = null;

    @property(ProgressBar)
    bar: ProgressBar = null;

    private _enterCallback:Function = null
    private _completeCallback:Function = null
    private _loadingResList:Array<string> = null;

    // 自定义加载列表,如果为空则播放动画后显示场景
    public setResLoadingList(list:Array<string>){
        this._loadingResList = list;
    }

    start () {
        if (!this._loadingResList || this._loadingResList.length == 0){
            return this._playTransAnimation();
        }

        this._loadingRes();
    }

    private _playTransAnimation(){
        let ani = this.node.getComponent(Animation);
        ani.play();
    }

    private _loadingRes() {
        ResourcesLoader.loadList(this._loadingResList,(finishNum:number,max:number)=>{
            let oldVal = this.bar.progress;
            let newVal = finishNum / max;
            if (newVal < oldVal) {
                newVal = oldVal;
            }
            this.bar.progress = newVal;
            this.percent.string = Math.floor(newVal * 100) + "%";
        },()=>{
            this._playTransAnimation();
        })     
    }

    setEnterCalback(cb:Function){
        this._enterCallback = cb;
    }

    setCompleteCallback(cb:Function){
        this._completeCallback = cb;
    }

    onEnterCallback(){
        if (this._enterCallback){
            this._enterCallback()
        }
    }

    onTransComplete(data:string){
        if (this._completeCallback){
            this._completeCallback()
        }
        sceneMgr.removeTransitionLayer();
    }
}