import { log, Node, Tween, Vec3 } from "cc";
import { Singleton } from "../../../../framework/components/Singleton";
import { HeroSpineNode, MonsterSpineNode, SpineNodeBase } from "../../common/spine/SpineNodeBase";
import { FightEvent } from "../event/FightEvent";
import { FightEventDataType } from "../event/FightEventDataType";
import { fightEventMgr } from "../event/FightEventMgr";
import { FightConstant } from "../FightConstant";
import { FightMainLayer } from "../FightMainLayer";
import { FightMainWorld } from "../FightMainWorld";
import { FightLayerBase } from "../layer/FightLayerBase";
import { RoleLayer } from "../layer/RoleLayer";
import { AcitonJump, ActionAddPrefab, ActionBase, ActionDelay, ActionGoBack, ActionMove, ActionSpineAnim } from "./Action";
import { ActionHide } from "./ActionHide";
import { ActionShow } from "./ActionShow";
import { attackActionMgr, AttackActionMgr } from "./AttackActionMgr";
import { resultActionMgr, ResultActionMgr } from "./ResultActionMgr";


export interface FightActionData {
    own:HeroSpineNode | MonsterSpineNode
    target:HeroSpineNode | MonsterSpineNode
    result:any
    animCfg:any
}

export let fightActionMgr:FightActionMgr = null;
/**
 * @description 行动管理器 
 * */
export class FightActionMgr extends Singleton{

    private _fightMainLayer:FightMainLayer = null;

    private _fightMainWorld:FightMainWorld = null;

    private _tempActionList:ActionBase[] = null

    public static init(mainLayer:FightMainLayer){
        fightActionMgr = FightActionMgr.getInstance<FightActionMgr>();
        fightActionMgr._init(mainLayer);
    }

    private _init(mainLayer:FightMainLayer) {
        this._fightMainLayer = mainLayer;
        this._fightMainWorld = this._fightMainLayer.getFightMainWorld();
        this._tempActionList = new Array<ActionBase>();
        AttackActionMgr.init();
        ResultActionMgr.init();
        this._initListeners();
    }

    private _initListeners() {
        fightEventMgr.addEventListener(FightConstant.FightEvent.Attack_Start,this._onAttackStart.bind(this));
        fightEventMgr.addEventListener(FightConstant.FightEvent.Attack_End,this._onAttackEnd.bind(this));
        fightEventMgr.addEventListener(FightConstant.FightEvent.Result_Start,this._onResultStart.bind(this));
        fightEventMgr.addEventListener(FightConstant.FightEvent.Result_End,this._onResultEnd.bind(this));
    }

    private _onAttackStart(event:FightEvent) {
        if (!this._fightMainWorld){
            this._fightMainWorld = this._fightMainLayer.getFightMainWorld();
        }
        let data:FightEventDataType.Action_Data = event.getEventData();
        this._parseAttack(data);
    }

    
    private _onAttackEnd(event:FightEvent) {
        
    }

    private _onResultStart(event:FightEvent) {
        let data:FightEventDataType.Action_Data = event.getEventData();
        this._parseResult(data);
    }

    private _onResultEnd(event:FightEvent) {
        // 做些清理工作;
        this._tempActionList.length = 0;
        fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Action_End,null));
    }

    private _parseAttack(data:FightEventDataType.Action_Data) {
        attackActionMgr.parse(data);
    }

    /**
     * 
     * @param data 播放结果
     */
    private _parseResult(data:FightEventDataType.Action_Data) {
        resultActionMgr.parse(data);
    } 

    public getAnimation(data:FightActionData):Tween<Node> {

        let animCfg = data.animCfg;
        let cmd = animCfg.cmd;
        let cmdEnum = this._getUnitActionEnumByName(cmd);

        switch (cmdEnum) {
            case  FightConstant.FightUnitAction.AddPrefab:

                return this.getUnitAction(ActionAddPrefab).add(data);

            case FightConstant.FightUnitAction.Delay:
                
                return this.getUnitAction(ActionDelay).delay(data);
        
            case FightConstant.FightUnitAction.SpineAnimation:

                return this.getUnitAction(ActionSpineAnim).play(data);

            case FightConstant.FightUnitAction.Color:
                return;
            case FightConstant.FightUnitAction.GoBack:

                return this.getUnitAction(ActionGoBack).goBack(data);

            case FightConstant.FightUnitAction.Hide:
                
                return this.getUnitAction(ActionHide).hide(animCfg.params[0]);

            case FightConstant.FightUnitAction.Show:
                
                return this.getUnitAction(ActionShow).show(animCfg.params[0]);

            case FightConstant.FightUnitAction.Move:

                return this.getUnitAction(ActionMove).move(data);

            case FightConstant.FightUnitAction.Jump:

                return this.getUnitAction(AcitonJump).jump(data);
        }
    }

    private getUnitAction<T extends typeof ActionBase>(clas:T):InstanceType<T> {
        let anim = new clas() as InstanceType<T>;
        // wait fot delet
        this._tempActionList.push(anim);
        return anim
    }

    public getOwnUnit(data:FightEventDataType.Action_Data):HeroSpineNode {
        return this.getUnit(data.Who);
    }

    public getUnit<T extends typeof SpineNodeBase>(who:[number,number]):InstanceType<T>{
        let camp:number = who[0];
        let index:number = who[1];
        let com = this._fightMainWorld.getCommonentInLayer(FightConstant.FightLayer.ROLE,RoleLayer);
        if (camp == FightConstant.FightUnitType.Attack){
            return com.getRoleAttacker(index) as InstanceType<T>;
        }else if (camp == FightConstant.FightUnitType.Defend) {
            return com.getRoleDefender(index) as InstanceType<T>;
        }
    }

    public getUnitPos(who:[number,number]):Vec3{
        let camp:number = who[0];
        let index:number = who[1];
        let com = this._fightMainWorld.getCommonentInLayer(FightConstant.FightLayer.ROLE,RoleLayer);
        let pos = com.getFomationPos(camp,index);
        if (pos){
            return pos;
        }
    }

    private _getUnitActionEnumByName(name:string):number{
        return FightConstant.FightUnitActionString[name]
    }

    /**
     * name
     */
    public getCommonentInLayer<T extends typeof FightLayerBase>(layerIndex,layerCtor:T){
        return this._fightMainWorld.getCommonentInLayer(layerIndex,layerCtor);
    }

    public destory(){
        FightActionMgr.destoryInstance();
        attackActionMgr.destory();
        resultActionMgr.destory();
    }

    public clear(){
        fightActionMgr = null;
    }
}