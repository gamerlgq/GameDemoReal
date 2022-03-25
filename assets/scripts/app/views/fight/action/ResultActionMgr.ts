import { log, tween, Tween } from "cc";
import { Singleton } from "../../../../framework/components/Singleton";
import { G } from "../../../common/GlobalFunction";
import { FightEvent } from "../event/FightEvent";
import { FightEventDataType } from "../event/FightEventDataType";
import { fightEventMgr } from "../event/FightEventMgr";
import { FightConstant } from "../FightConstant";
import { FightActionData, fightActionMgr } from "./FightActionMgr";


export let resultActionMgr:ResultActionMgr = null;
/**
 * @description 攻击行动管理器 
 * */
export class ResultActionMgr extends Singleton{
    public static init(){
        resultActionMgr = ResultActionMgr.getInstance<ResultActionMgr>();
    }

    public parse(data:FightEventDataType.Attack_Start){
        
        let resultDatas = data.Result;
        resultDatas.forEach(resultData => {
            let animationConfig = this._getAnimationConfig(data,resultData);
            this._parseResultAction(data,animationConfig,resultData);
        });
    }

    private _getAnimationConfig(data:FightEventDataType.Attack_Start,resultData:any) {

        let attackData = data.Attack;
        let skillId = attackData[1];
        let config = G.getConfig("FightSkill",skillId);
        let resultActionId = resultData[0];
        switch (resultActionId) {
            case FightConstant.FightReultAction.Action_Dodge:// 闪避
                
                return G.getConfig("FightEmbattled",config.dodgeAnimation);

            case FightConstant.FightReultAction.Action_Block://格挡

                return G.getConfig("FightEmbattled",config.blockAnimation);

            case FightConstant.FightReultAction.Action_HP://hp变化

                return G.getConfig("FightEmbattled",config.embattledAnimation);

            case FightConstant.FightReultAction.Action_Dead://死亡

                return null;

            case FightConstant.FightReultAction.Action_Hit_Back://反击

                return G.getConfig("FightEmbattled",config.hitbackAnimation);

            case FightConstant.FightReultAction.Action_Buff://直接伤害(添加/删除buff)

                return null;

            case FightConstant.FightReultAction.Action_Lock://无法行动

                return null;
        }
    }

    private _parseResultAction(data:FightEventDataType.Attack_Start,config:any,resultData:any) {

        // 全局技能时间轴
        let skillTimeline = config.skillTimeline;
        if (skillTimeline.length > 0){
            this._runSkillTimelineAction(skillTimeline,data,resultData);
        }

        // 受击单位时间轴
        let defendUnitTimeline = config.defendUnitTimeline;
        if (defendUnitTimeline.length > 0){
            this._runUnitDefendimelineAction(defendUnitTimeline,data,resultData);
        }
    }

    private _runSkillTimelineAction(skillTimeline:Array<any>,data:FightEventDataType.Attack_Start,resultData:any) {
        let allTimeLine:Tween<unknown>[] = [];
        let camp = resultData[1];
        let targets = resultData[2];
        let tarUnits = [];
        targets.forEach(target => {
            let tarUnit = fightActionMgr.getUnit([camp,target[0]]);
            tarUnits.push(tarUnit);
        });

        for (let index = 0; index < tarUnits.length; index++) {
            const tarUnit = tarUnits[index];
            skillTimeline.forEach(animations => {
                let oneTimeTween = tween();
                animations.forEach(anim => {
                    let target = targets[index];
                    let fightActionData:FightActionData = {
                        own: tarUnit,
                        target:tarUnit,
                        result: target[1],
                        animCfg:anim
                    };
                    let tween = fightActionMgr.getAnimation(fightActionData);
                    oneTimeTween.then(tween);
                });
                allTimeLine.push(oneTimeTween);
            });
            
            if (allTimeLine.length > 1){
                let parallel = tween(tarUnit).parallel(...allTimeLine);
                parallel.start();
            }else{
                let t = allTimeLine[0];
                t.target(tarUnit).start();
            }   
        }    
    }

    private _runUnitDefendimelineAction(unitTimeline:Array<any>,data:FightEventDataType.Attack_Start,resultData:any) {
        let allTimeLine:Tween<unknown>[] = [];
           let camp = resultData[1];
        let targets = resultData[2];
        let tarUnits = [];
        targets.forEach(target => {
            let tarUnit = fightActionMgr.getUnit([camp,target[0]]);
            tarUnits.push(tarUnit);
        });


        for (let index = 0; index < tarUnits.length; index++) {

            const tarUnit = tarUnits[index];
            let target = targets[index];
            unitTimeline.forEach(animations => {
                let oneTimeTween = tween();
                animations.forEach(anim => {
                    let fightActionData:FightActionData = {
                        own: tarUnit,
                        target:tarUnit,
                        result: target[1],
                        animCfg:anim
                    };

                    let tween = fightActionMgr.getAnimation(fightActionData);
                    oneTimeTween.then(tween);
                });
                allTimeLine.push(oneTimeTween);
            });
    
    
            if (allTimeLine.length > 1){
                let parallel = tween(tarUnit).parallel(...allTimeLine);
                parallel.then(tween().call(()=>{
                    log("result action finished!2")
                    // 攻击结束
                    fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Result_End,data));
                })).start();
            }else{
                let t = allTimeLine[0];
                t.target(tarUnit).then(tween().call(()=>{
                    log("result action finished!1")
                    // 结果结束
                    fightEventMgr.send(new FightEvent(FightConstant.FightEvent.Result_End,data));
                })).start();
            }
        }
    }

    public destory(){
        ResultActionMgr.destoryInstance();
    }

    public clear(){
        resultActionMgr = null;
    }
}