
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
    private _curProgress:number = null;
    private _maxProgress:number = null;

    // 自定义加载列表,如果为空则播放动画后显示场景
    public setResLoadingList(list:Array<string>){
        this._loadingResList = list;
    }

    start () {
        log(this._loadingResList,"this._loadingResList");
        if (!this._loadingResList || this._loadingResList.length == 0){
            log("121121212")
            return this._playTransAnimation();
        }

        log(this._loadingResList && this._loadingResList.length > 0)

        this._loadingRes();
    }

    private _playTransAnimation(){
        let ani = this.node.getComponent(Animation);
        ani.play();
    }

    private _loadingRes() {
        // ResourcesLoader.loadList(this._loadingResList,(finishNum:number,max:number)=>{
        //     let oldVal = this.bar.progress;
        //     let newVal = finishNum / max;
        //     if (newVal < oldVal) {
        //         newVal = oldVal;
        //     }
        //     log(newVal,oldVal);
        //     this.bar.progress = newVal;
        //     this.percent.string = Math.floor(newVal * 100) + "%";
        // },()=>{
        //     this._playTransAnimation();
        // })

        this.bar.progress = 0;
        [this._curProgress,this._maxProgress] = [0,0];
        let curIndex = 0;
        for (let index = 0; index < this._loadingResList.length; index++) {
            const url = this._loadingResList[index];
            ResourcesLoader.loadDir(url,(finishNum: number, max: number)=>{
                // let oldVal = this.bar.progress;
                let newVal = finishNum / max;
                // if (newVal < oldVal) {
                    // newVal = oldVal;
                // }
                // this._curProgress+=finishNum;
                // if (index == curIndex){
                //     this._maxProgress+=this._maxProgress;
                //     curIndex+=1;
                // }
                
                log(finishNum,max);
                this.bar.progress = newVal;
                this.percent.string = Math.floor(newVal * 100) + "%";
            },()=>{
                
            })
        }


        // let path = this._loadingResList.shift();
        // let cb = ()=>{
        //     path = this._loadingResList.shift();
        //     if (path) {
        //         this._loadRes(path,cb);
        //     }else{
        //         this._playTransAnimation();
        //     }
        // }
        // this._loadRes(path,cb);    
    }

    private _loadRes(path:string, onComplete?:() => void){
        ResourcesLoader.loadDir(path,(finishNum: number, max: number)=>{
            let oldVal = this.bar.progress;
            let newVal = finishNum / max;
            if (newVal < oldVal) {
                newVal = oldVal;
            }
            log(newVal,oldVal);
            this.bar.progress = newVal;
            this.percent.string = Math.floor(newVal * 100) + "%";
        },()=>{
            if (onComplete){
                onComplete();
            }
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