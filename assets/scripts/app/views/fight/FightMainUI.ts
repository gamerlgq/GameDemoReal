/*
 * @Author: liuguoqing
 * @Date: 2022-03-19 11:17:19
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-20 17:15:25
 * @Description: file content
 */

import { _decorator, Node, EventTouch, AnimationComponent, Button, Label, CCFloat, js, Sprite, log, } from 'cc';
import { sceneMgr } from '../../../framework/core/SceneMgr';
import { socketMgr } from '../../../framework/net/SocketMgr';
import { ComponentBase } from '../../../framework/ui/ComponentBase';
import { Protocol } from '../../define/Protocol';
import { FightEvent } from './event/FightEvent';
import { FightEventDataType } from './event/FightEventDataType';
import { fightEventMgr } from './event/FightEventMgr';
import { FightConstant } from './FightConstant';
const { ccclass, property } = _decorator;
 
@ccclass('FightMainUI')
export class FightMainUI extends ComponentBase {

    @property(Button)
    startBtn:Button=null;

    @property(Label)
    lblRound:Label=null;

    @property(Label)
    lblSpeed:Label=null;

    @property(Sprite)
    spSpeed:Sprite=null;

    @property([CCFloat])
    speedList:number[] = [];

    private _root:Node = null;
    private _curSpeedIdx:number = 0;

    onLoad(){
        this._root = this.node.parent;
        this._addFightListeners();
        this._setSpeed();
    }

    private _addFightListeners(){
        fightEventMgr.addEventListener(FightConstant.FightEvent.Round_Start,this._updateRoundLabel.bind(this));
    }

    // 设置回合数
    private _updateRoundLabel(event:FightEvent) {
        let data:FightEventDataType.Round_Start = event.getEventData();
        let round = data.Round.toString();
        this.lblRound.setString(round);
    }

    private _setSpeed():number{
        let speed:number = 1;
        if ( this._curSpeedIdx != 0 ){
            speed = this.speedList[this._curSpeedIdx];
        }

        if ( speed == 1 ){
            this.lblSpeed.enabled = false;
            this.spSpeed.enabled = true;
            return speed;
        }

        this.lblSpeed.enabled = true;
        this.spSpeed.enabled = false;
        if ( speed == 0.5 ){
            this.lblSpeed.setString("1/2倍");
            return speed;
        }
        
        this.lblSpeed.setString(js.formatStr("%d倍",speed));
        return speed;
    }

    // 战斗开始
    startGame(){
        
    }

    onClickStartBtn(event:EventTouch,customEventData:string){
        this.startBtn.node.active = false;
        let animteComp = this._root.getComponent(AnimationComponent);
        animteComp.play();
        fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Game_Star,null));
    }

    onClickCloseBtn(event:EventTouch,customEventData:string){
        sceneMgr.popTableLayer();
    }

    update(dt:number){

    }

    onClickSpeedBtn(event:EventTouch,customEventData:string){
        this._curSpeedIdx += 1 ;
        if (this._curSpeedIdx >= this.speedList.length) {
            this._curSpeedIdx = 0;
        }
        let speed = this._setSpeed();
        socketMgr.sendInnerMsg(Protocol.Inner.SetAnimationSpeed,speed);
    }
}