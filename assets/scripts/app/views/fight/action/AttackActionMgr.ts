import { log, tween, Tween } from "cc";
import { Singleton } from "../../../../framework/components/Singleton";
import { G } from "../../../common/GlobalFunction";
import { FightEvent } from "../event/FightEvent";
import { FightEventDataType } from "../event/FightEventDataType";
import { fightEventMgr } from "../event/FightEventMgr";
import { FightConstant } from "../FightConstant";
import { FightActionData, fightActionMgr } from "./FightActionMgr";


export let attackActionMgr:AttackActionMgr = null;
/**
 * @description 攻击行动管理器 
 * */
export class AttackActionMgr extends Singleton{
    public static init(){
        attackActionMgr = AttackActionMgr.getInstance<AttackActionMgr>();
    }

    public parse(data:FightEventDataType.Action_Data){
        let attackData = data.Attack;
        let attackActionId = attackData[0];
        switch (attackActionId) {
            case FightConstant.FightAttackAction.Action_Fail:// 攻击失败
                
                break;
            case FightConstant.FightAttackAction.Action_Skill://技能攻击
                this._parseSkill(data)
                break;
            case FightConstant.FightAttackAction.Action_Buff://直接伤害(一些dot，每回合的伤害/每回合治疗等)

                break;
        }
    }

    private _parseSkill(data:FightEventDataType.Action_Data) {
        let attackData = data.Attack;
        let skillId = attackData[1];
        let config = G.getConfig("FightSkill",skillId);

        let skillAnimation = config.skillAnimation;
        let hitConfig = G.getConfig("FightHit",skillAnimation);

        // 全局技能时间轴
        let skillTimeline = hitConfig.skillTimeline;
        if (skillTimeline.length > 0){
            this._runSkillTimelineAction(skillTimeline,data);
        }

        // 攻击单位时间轴
        let unitHitTimeline = hitConfig.attackUnitTimeline;
        if (unitHitTimeline.length > 0){
            this._runAttackUnitTimelineAction(unitHitTimeline,data);
        }
    } 

    private _runSkillTimelineAction(skillTimeline:Array<any>,data:FightEventDataType.Action_Data) {
        let allTimeLine:Tween<unknown>[] = [];
        let ownUnit = fightActionMgr.getOwnUnit(data);
        let attackData = data.Attack;
        let whom = attackData[2];
        let tarUnit = null;
        if (whom.length>0){
            tarUnit = fightActionMgr.getUnit(whom);
        }
            
        skillTimeline.forEach(animations => {
            let oneTimeTween = tween();
            animations.forEach(anim => {
                let fightActionData:FightActionData = {
                    own: ownUnit,
                    target:tarUnit,
                    result: undefined,
                    animCfg:anim
                };
                let tween = fightActionMgr.getAnimation(fightActionData);
                oneTimeTween.then(tween);
            });
            allTimeLine.push(oneTimeTween);
        });

        if (allTimeLine.length > 1){
            let parallel = tween(ownUnit).parallel(...allTimeLine);
            parallel.call(()=>{
                log("attack action finished!")
                // 攻击结束
                fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Attack_End,data));
            }).start();
        }else{
            let t = allTimeLine[0];
            t.target(ownUnit).call(()=>{
                log("attack action finished!")
                // 攻击结束
                fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Attack_End,data));
            }).start();
        } 
    }


    private _runAttackUnitTimelineAction(unitTimeline:Array<any>,data:FightEventDataType.Action_Data) {
        let allTimeLine:Tween<unknown>[] = [];
        let ownUnit = fightActionMgr.getOwnUnit(data);
        let attackData = data.Attack;
        let whom = attackData[2];
        let tarUnit = null;
        if (whom.length>0){
            tarUnit = fightActionMgr.getUnit(whom);
        }
            
        unitTimeline.forEach(animations => {
            let oneTimeTween = tween();
            animations.forEach(anim => {
                let fightActionData:FightActionData = {
                    own: ownUnit,
                    target:tarUnit,
                    result: undefined,
                    animCfg:anim
                };
                let tween = fightActionMgr.getAnimation(fightActionData);
                oneTimeTween.then(tween);
            });
            allTimeLine.push(oneTimeTween);
        });

        if (allTimeLine.length > 1){
            let parallel = tween(ownUnit).parallel(...allTimeLine);
            parallel.call(()=>{
                log("attack action finished!")
                // 攻击结束
                fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Attack_End,data));
            }).start();
        }else{
            let t = allTimeLine[0];
            t.target(ownUnit).call(()=>{
                log("attack action finished!")
                // 攻击结束
                fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Attack_End,data));
            }).start();
        } 
    }

    public destory(){
        AttackActionMgr.destoryInstance();
    }

    public clear(){
        attackActionMgr = null;
    }
}