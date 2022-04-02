/*
 * @Author: liuguoqing
 * @Date: 2022-03-19 11:17:19
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-19 13:51:45
 * @Description: file content
 */

export namespace FightConstant {

    // 是否开启技能编辑器
    export const Open_Fight_Editor:boolean = true;

    // 战斗场景层级
    export enum FightLayer {
        FORMATION,//布阵层
        BOTTM_EFFECT,//底层特效层
        ROLE,//角色层
        TOP_EFFECT,//上层特效层
        BLOOD,//数字层
        DIALOG,//对话层
    }

    // 单位类型
    export enum FightUnitType {
        Attack,//攻击方
        Defend,//防守方
    }

    // 单位状态
    export enum FightUnitState {
        Stand,//待机
        Run,//跑动
        Jump,//跳跃
        Attack,//攻击
        Skill,//技能
        Retreat,//后撤
        Hit,//受击
        Did,//死亡
    }

    // 全局技能action
    export enum FightSkillAction {
        AddPrefab,//添加预制体
        Delay,//延迟
        Camera,//摄像机效果
        ShowBlood,//瓢子
        Dialog,//对话
    }

    // 单位action
    export enum FightUnitAction {
        AddPrefab,//添加预制体
        Delay,//延迟
        SpineAnimation,//特殊动作指令,每个spine角色不一样
        Color,//颜色变化
        GoBack,//返回阵位
        Hide,//消失
        Show,//显示
        Move,//移动
        Jump,//跳跃
    }

    // 单位acion id对应的字符串；
    export const FightUnitActionString = {
        AddPrefab:FightUnitAction.AddPrefab,//添加预制体
        Delay:FightUnitAction.Delay,//延迟
        SpineAnimation:FightUnitAction.SpineAnimation,//特殊动作指令,每个spine角色不一样
        Color:FightUnitAction.Color,//颜色变化
        GoBack:FightUnitAction.GoBack,//返回阵位
        Hide:FightUnitAction.Hide,//消失
        Show:FightUnitAction.Show,//显示
        Move:FightUnitAction.Move,//移动
        Jump:FightUnitAction.Jump,//跳跃
    }

    // 单位effect添加部位 
    export enum FightUnitEffectPart {
        Front, //胸前,默认
        Floot, //脚底
        Head, // 头部
    }

    // 攻击action
    export enum FightAttackAction {
        Action_Fail,//攻击失败
        Action_Skill,//技能攻击
        Action_Buff,//buff(添加/删除buf,一些dot，每回合的伤害/每回合治疗等)
        Action_Lock,//无法行动
    }

    // 结果action
    export enum FightReultAction {
        Action_Dodge,//闪避
        Action_Block,//格挡
        Action_HP,//hp变化
        Action_Dead,//死亡
        Action_Hit_Back,//反击
        Action_Buff,//buff(添加/删除buf,一些dot，每回合的伤害/每回合治疗等)
        Action_Lock,//无法行动
    }

    // hp的变化action
    export enum FightHPAction {
        Action_HP_Damage,//伤害
        Action_HP_Cure,//治疗
        Action_HP_Absort,//吸收
        Action_HP_Crit,//暴击
    }

    // buff的变化aciton
    export enum FightBuffAction {
        Action_Buff_add, //添加buff
        Action_Buff_del, //删除buff
        Action_Buff_hurt,//buff伤害
        Action_Buff_cure,//buff治疗
    }

    // 战斗事件
    export enum FightEvent {
        Game_Star,//战斗开始
        Game_End,//战斗结束
        Game_Pause,//游戏暂停
        Game_Resume,//游戏继续
        Game_Replay,//游戏重播
        Round_Start,//当前大回合开启
        Round_End,//当前大回合结束
        Action_Star,//当前小回合开始
        Action_End,//当前小回合结束
        Attack_Start,//攻击开始
        Attack_End,//攻击结束
        Result_Start,//攻击结果开始
        Result_End,//攻击结果结束
        Single_Action_Done,//单个action结束
        Blood_Change,//血条变化
        Show_Dialog//显示对话
    }
}
