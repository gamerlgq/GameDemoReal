/*
 * @Author: liuguoqing
 * @Date: 2022-03-19 11:17:19
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-20 16:14:40
 * @Description: file content
 */
import { error, js, log, v3, Vec3 } from "cc";
import { yy } from "../../../define/YYNamespace";
import { RoleSpineFactory } from "../../common/spine/RoleSpineFactory";
import { HeroSpineNode, MonsterSpineNode } from "../../common/spine/SpineNodeBase";
import { FightActionData } from "../action/FightActionMgr";
import { FightData, FightFormationData } from "../data/FightData";
import { fightDataMgr } from "../data/FightDataMgr";
import { FightEvent } from "../event/FightEvent";
import { FightEventDataType } from "../event/FightEventDataType";
import { fightEventMgr } from "../event/FightEventMgr";
import { FightConstant } from "../FightConstant";
import { FightLayerBase } from "./FightLayerBase";
import { FomationLayer } from "./FomationLayer";

export class RoleLayer extends FightLayerBase {
  
    private _attackRoleList:Array<HeroSpineNode> = new Array<HeroSpineNode>();
    private _defendRoleList:Array<MonsterSpineNode> = new Array<MonsterSpineNode>();

    public init() {
        this._addListeners();
        this._loadRoles();
    }

    private _addListeners() {
        fightEventMgr.addEventListener(FightConstant.FightEvent.Blood_Change,this._onBloodChange.bind(this));
    }

    private _onBloodChange(event:FightEvent) {
        const data:FightEventDataType.Blood_Change = event.getEventData();
        const fightActionData:FightActionData = data.Data;
        const tar = fightActionData.target;
        const camp = tar.camp;
        const idx = tar.formationIndex;
        const result = fightActionData.result;
        let cur = result[2];
        let max = result[3]
        const role = this.getRole(camp,idx);
        if (role){
            role.updateBlood(cur,max)
        }
    }

    private _loadRoles() {
        let rp = fightDataMgr.getFightData(FightData);
        let attackers = rp.getAttackFormationDatas();
        this._loadAttackers(attackers);
        let defenders = rp.getDefendFormationDatas();
        this._loadDefenders(defenders);
    }

    private async _loadAttackers(attackers:Array<FightFormationData>) {
        for (let index = 0; index < attackers.length; index++) {
            let attackInfo = attackers[index];
            let heroId = attackInfo.getHeroId();
            if (heroId == -1){
                return error(js.formatStr("RoleLayer:_loadAttackers heroId = -1 index:[%d]",index));
            }
      
            let node = await RoleSpineFactory.create(HeroSpineNode,heroId);
            this.node.addChild(node);
            this._setPosition(node,index,FightConstant.FightUnitType.Attack);
            this._attackRoleList.push(node);
            node.addBloodUI();
            node.setSiblingIndex(-1);
            node.formationIndex = index;
            node.camp = FightConstant.FightUnitType.Attack;
        }
    }

    private async _loadDefenders(defenders:Array<FightFormationData>){
        for (let index = 0; index < defenders.length; index++) {
            let defenderInfo = defenders[index];
            let heroId = defenderInfo.getHeroId();
            if (heroId == -1){
                return error(js.formatStr("RoleLayer:_loadDefenders heroId = -1 index:[%d]",index));
            }

            let node = await RoleSpineFactory.create(MonsterSpineNode,heroId);
            this.node.addChild(node);
            this._setPosition(node,index,FightConstant.FightUnitType.Defend);
            this._defendRoleList.push(node);
            node.setScale(v3(-1,1,1));
            node.changeSkin("2");
            node.addBloodUI();
            node.setSiblingIndex(-1)
            node.formationIndex = index;
            node.camp = FightConstant.FightUnitType.Defend;
        }
    }

    private _setPosition(node:HeroSpineNode,idx:number,camp:number) {
        let pos = this.getFomationPos(camp,idx);
        node.position = pos;
    }

    public startGame(){
        this._attackRoleList.forEach(element => {
            element.play(yy.macro.HeroAnimate.Idle,true);
            element.changeEquip("2","dao2","dao2");
        });

        this._defendRoleList.forEach(element => {
            element.play(yy.macro.HeroAnimate.Idle,true);
            element.changeEquip("2","dao2","dao2");
        });
    }

    public updateView(data) {
        
    }

    public getRoleAttacker(index:number):HeroSpineNode{
        return this._attackRoleList[index];
    }

    public getRoleDefender(index:number):MonsterSpineNode {
        return this._defendRoleList[index];
    }

    /**
     * getRole
     */
    public getRole(camp:number,index:number):HeroSpineNode | MonsterSpineNode {
        if (camp == FightConstant.FightUnitType.Attack) {
            return this.getRoleAttacker(index);
        }else if (camp == FightConstant.FightUnitType.Defend) {
            return this.getRoleDefender(index);
        }
    }

    /**
     * 
     * @param idx number 阵型索引
     * @param camp number 所在阵营 
     */
    public getFomationPos(camp:number,idx:number):Vec3{
        let isAttacker:boolean = camp == FightConstant.FightUnitType.Attack;
        let com = this._mainWorld.getCommonentInLayer(FightConstant.FightLayer.FORMATION,FomationLayer);
        let pos = isAttacker? com.getAttackPosByIndex(idx) : com.getDefendPosByIndex(idx);
        return pos.clone();
    }
}