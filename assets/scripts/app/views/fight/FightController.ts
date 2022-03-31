/*
 * @Author: liuguoqing
 * @Date: 2022-03-19 11:17:19
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-20 22:57:06
 * @Description: file content
 */
import { Animation, AnimationClip, find, log } from "cc";
import { Singleton } from "../../../framework/components/Singleton";
import { gameMgr } from "../../../framework/core/GameMgr";
import { CameraLock } from "../../common/animation/CameraLock";
import { FightData } from "./data/FightData";
import { fightDataMgr } from "./data/FightDataMgr";
import { FightEvent } from "./event/FightEvent";
import { FightEventDataType } from "./event/FightEventDataType";
import { fightEventMgr } from "./event/FightEventMgr";
import { FightConstant } from "./FightConstant";

export let fightController:FightController = null;
/**
 * @description 回合控制器 
 * */
export class FightController extends Singleton{

    // 当前大回合
    private _round:number=0;
    // 当前行动(每回合有多个)
    private _action:number=0;
    // fight data
    private _fightData:FightData;
    // cur round data
    private _roundData:Array<Array<any>>;
    // 是否暂停
    private _isPause:boolean=false;

    public static init(){
        fightController = FightController.getInstance<FightController>();
        fightController._init();
    }

    private _init(){
        this._initListeners();
        this._initData();
    }

    private _initListeners() {
        fightEventMgr.addEventListener(FightConstant.FightEvent.Game_Star,this._onGameStart.bind(this));
        fightEventMgr.addEventListener(FightConstant.FightEvent.Action_End,this._onActionEnd.bind(this));
        fightEventMgr.addEventListener(FightConstant.FightEvent.Game_Replay,this._onReplay.bind(this));
        fightEventMgr.addEventListener(FightConstant.FightEvent.Game_Pause,this._onPause.bind(this));
        fightEventMgr.addEventListener(FightConstant.FightEvent.Game_Resume,this._onResume.bind(this));
    }

    private _initData(){

        this._round = 0 ;
        this._action = 0
        this._isPause = false;

        this._fightData = fightDataMgr.getFightData(FightData);
        let data = this._fightData.getRoundData();
        this._roundData = data[this._round];
    }

    // 游戏开始
    private _onGameStart(){
        this._playCameraAnimation();
    }

    private _playCameraAnimation() {
        let fightCamera = gameMgr.getCamera("MainCamera");
        let animation = fightCamera?.node?.getComponent(Animation);
        let scriptCom = fightCamera?.node?.getComponent(CameraLock);
        scriptCom?.setEndCallback(this._cameraAniEndCallback.bind(this));
        animation.play("CameraLock");
    }

    private _cameraAniEndCallback() {
        this._roundStart();   
    }

    // 每回合小行动结束
    private _onActionEnd() {
        this._action += 1;
        this._actionStart();
    }

    // 重播
    private _onReplay(){
        this._initData();
        fightEventMgr?.send(new FightEvent(FightConstant.FightEvent.Game_Star,null));
    }

    // 暂停
    private _onPause(){
        this._isPause = true;
    }

    // 恢复
    private _onResume(){
        this._isPause = false;
    }

    // 大回合开始
    private _roundStart() {
        let data = this._fightData.getRoundData();
        this._roundData = data[this._round];
        this._round += 1;//回合数+1
        this._action = 0;//每回合归零
        if (this._isGameEnd()){
            return this._gameEnd();
        }
        this._nextRound();
    }

    private _nextRound(){
        let data:FightEventDataType.Round_Start = {
            Round: this._round
        }
        fightEventMgr?.send(new FightEvent(FightConstant.FightEvent.Round_Start,data));
        this._actionStart()
    }

    // 每回合小行动开始
    private _actionStart() {
        if (this._isRoundFinished()){
            return this._roundEnd();
        }
        this._nextAction();
    }

    private _nextAction() {
        let action = this._roundData[this._action];
        let data:FightEventDataType.Action_Start = {
            Action: this._action,
            ActionData: action
        }
        fightEventMgr?.send(new FightEvent(FightConstant.FightEvent.Action_Star,data));
    }

    // 是否大回合结束
    private _isRoundFinished():boolean {
        return this._action >= this._roundData.length
    }

    // 大回合结束
    private _roundEnd() {
        this._roundStart();
    }

    // 是否战斗结束
    private _isGameEnd(){
        let data = this._fightData.getRoundData();
        return this._round > data.length;
    }

    // 战斗结束
    private _gameEnd() {
        fightEventMgr?.send(new FightEvent(FightConstant.FightEvent.Game_End,null));
    }

    public destory(){
        FightController.destoryInstance();
    }

    public clear(){
        fightController = null;
    }
    
}