/*
 * @Author: liuguoqing
 * @Date: 2022-03-19 11:17:19
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-20 23:06:12
 * @Description: file content
 */

import { _decorator, Component, Node, Label, log, EventTouch, resources, View } from 'cc';
import { sceneMgr } from '../../../framework/core/SceneMgr';
import { ComponentBase } from '../../../framework/ui/ComponentBase';
import { ViewProtocol } from '../../define/ViewProtocol';
import { fightController } from '../fight/FightController';
const { ccclass, property } = _decorator;
 
@ccclass('MainCityUI')
export class MainCityUI extends ComponentBase {

    @property(Label)
    roleName:Label=null;

    start(){
        this.roleName.setString("麦坤雄");

    }

    // update (deltaTime: number) {
    //     // [4]
    // }
    onClickBattleBtn(event:EventTouch,customEventData: string){
        sceneMgr.sendCreateView(ViewProtocol.FightFormation);
    }

    onClickQuestionBtn(event:EventTouch,customEventData: string){
        sceneMgr.sendCreateView(ViewProtocol.PreviewReward);
    }

    onClickAddRes1Btn(event:EventTouch,customEventData: string){
        sceneMgr.sendCreateView(ViewProtocol.Tips,customEventData);
    }

    onClickAddRes2Btn(event:EventTouch,customEventData: string){
        sceneMgr.sendCreateView(ViewProtocol.Tips,customEventData);
    }

    onClickChat(){
        sceneMgr.sendCreateView(ViewProtocol.ChatLayer)
    }
}