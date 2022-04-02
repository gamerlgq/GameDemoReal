/*
 * @Author: liuguoqing
 * @Date: 2022-03-19 11:17:19
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-20 23:02:10
 * @Description: file content
 */

import { _decorator, Prefab, instantiate, Node, js, sys, JsonAsset, log, director, TweenSystem, AnimationManager } from 'cc';
import { audioMgr } from '../../../framework/core/audio/AudioManager';
import { ResourcesLoader } from '../../../framework/data/ResourcesLoader';
import { Message } from '../../../framework/listener/Message';
import { LayerBase } from '../../../framework/ui/LayerBase';
import { Protocol } from '../../define/define';
import { viewRegisterMgr } from '../../define/ViewRegisterMgr';
import { fightActionMgr, FightActionMgr } from './action/FightActionMgr';
import { FightData } from './data/FightData';
import { fightDataMgr, FightDataMgr } from './data/FightDataMgr';
import { FightEvent } from './event/FightEvent';
import { fightEventMgr,FightEventMgr } from './event/FightEventMgr';
import { fightBloodMgr, FightBloodMgr } from './FightBloodMgr';
import { FightConstant } from './FightConstant';
import { fightController,FightController } from './FightController';
import { FightMainUI } from './FightMainUI';
import { FightMainWorld } from './FightMainWorld';
import { fightPlayer, FightPlayer } from './FightPlayer';
const { ccclass, property } = _decorator;
 
@ccclass('FightMainLayer')
export class FightMainLayer extends LayerBase {
    
    private _fightMainWorld:FightMainWorld = null;
    private _fightMainUI:FightMainUI = null;
    private _content:Node = null;
    private _rootNode:Node = null;
    private _gameSpeed:number = 1;

    onLoad () {
        super.onLoad();
        this._rootNode = this.node.parent;
        this._content = this._rootNode.getChildByName("content");
    }

    /**
     * @description 初始化
     */
    public init(report:JsonAsset) {
        this._initManagers(report);
        this._initBg();
        this._loadMainWorld();
        this._loadMainUI();
        this._playBgMusic();
        this._addListeners();
    }

    private _initManagers(report:JsonAsset) {
        // 战报数据管理器
        FightDataMgr.init();
        fightDataMgr.parse(report,FightData);
        // 事件派发器
        FightEventMgr.init();
        // 回合控制器
        FightController.init();
        // 战斗播放器
        FightPlayer.init();
        // action管理器
        FightActionMgr.init(this);
        // 飘血管理器
        FightBloodMgr.init(this);
    }

    private _initBg() {
        
    }

    private _loadMainWorld() {
        this._fightMainWorld = new FightMainWorld();
        this._fightMainWorld.init();
        this._content.addChild(this._fightMainWorld);
    }

    private _loadMainUI() {
        let viewInfo = null;
        if (FightConstant.Open_Fight_Editor){
            viewInfo = viewRegisterMgr.getViewInfo("fight","FightEditorUI");
        }else{
            viewInfo = viewRegisterMgr.getViewInfo("fight","FightMainUI");
        }
        
        ResourcesLoader.loadWithViewInfo(viewInfo,(data:Prefab)=>{
            let uiNode = instantiate(data);
            this._content.addChild(uiNode);
            this._fightMainUI = uiNode.getComponentInChildren("FightMainUI") as FightMainUI;
        })
    }

    private _playBgMusic() {
        audioMgr.playMusic("fight/avs/zhengzhan_bjyy");
    }

    private _addListeners() {
        fightEventMgr.addEventListener(FightConstant.FightEvent.Game_Star,this._startGame.bind(this));
        this.addMsgListener(Protocol.Inner.SetAnimationSpeed,this._setSpeed.bind(this));
    }

    private _startGame(event:FightEvent) {
        this._fightMainWorld.startGame();
        this._fightMainUI.startGame();
    }

    /**
     * @return FightMainWorld
     */
    public getFightMainWorld():FightMainWorld {
        return this._fightMainWorld;
    }

    update (dt: number) {
        this._fightMainWorld?.tick(dt);

        if (this._gameSpeed == 2){
            director.getSystem(TweenSystem.ID).update(dt);
            director.getSystem(AnimationManager.ID).update(dt);
        }
    }

    onDestroy(){
        fightController.destory();
        fightDataMgr.destory();
        fightPlayer.destory();
        fightActionMgr.destory();
        fightBloodMgr.destory();
        fightEventMgr.destory();
        audioMgr.popMusic();
    }

    private _setSpeed(event:Message) {
        let data = event.getRawData();
        this._gameSpeed = data;
    }
}