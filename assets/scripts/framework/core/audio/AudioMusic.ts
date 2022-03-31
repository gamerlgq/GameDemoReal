import { AudioClip, AudioSource, error, log, Tween, tween, _decorator } from 'cc';
import { ResourcesLoader } from '../../data/ResourcesLoader';
import { audioMgr } from './AudioManager';
const { ccclass, menu } = _decorator;

/** 背景音乐 */
@ccclass('AudioMusic')
export class AudioMusic extends AudioSource {
    public onComplete: Function | null = null;
    private _progress: number = 0;
    private _url: string | null = null;
    private _isPlay: boolean = false;

    private _tweenVo;

    /**
     * 设置音乐当前播放进度
     * @param progress 进度百分比(0~1)
     */
    public get progress() {
        this._progress = this.currentTime / this.duration;
        return this._progress;
    }
    public set progress(value: number) {
        this._progress = value;
        this.currentTime = value * this.duration;
    }

    public load(url: string,isLoop:boolean=true, callback?: Function) {
        ResourcesLoader.load(url, (data:AudioClip)=>{
            this._fadeOut(()=>{
                this.clip = data;
                this.currentTime = 0;
                this.play();
                this.loop = isLoop;
                callback && callback();
                this._url = url;

                this._fadeIn()
            })
        },AudioClip)
    }

    private _fadeOut(onFin:Function) {
        if (this.playing) {
            this._tweenVo?.stop();
            this._tweenVo = new Tween(this);
            this._tweenVo.to(1, {volume:0}, {onComplete:(tar)=>{
                this._tweenVo = null
                this.stop()
                ResourcesLoader.release(this._url!);
                onFin()
            }}).start()
        }
        else {
            onFin()
        }
    }

    private _fadeIn() {
        this._tweenVo?.stop();
        this._tweenVo = new Tween(this);
        this.volume = 0;
        this._tweenVo.to(1, {volume:audioMgr.musicVolume}, {onComplete:()=>{this._tweenVo=null}}).start()
    }

    update(dt: number) {
        if (this.currentTime > 0) {
            this._isPlay = true;
        }

        if (this._isPlay && this.playing == false) {
            this._isPlay = false;
            this.onComplete && this.onComplete();
        }
    }

    release() {
        if (this._url) {
            ResourcesLoader.release(this._url);
            this._url = null;
        }
    }
}
