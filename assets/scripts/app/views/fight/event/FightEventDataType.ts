/*
 * @Author: liuguoqing
 * @Date: 2022-03-19 13:24:11
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-19 14:10:02
 * @Description: file content
 */

import { Node } from "cc";
import { FightActionData } from "../action/FightActionMgr";

// 战斗事件数据类型 let data:FightEventDataType.xxxx = event.getData()
export namespace FightEventDataType {
    export interface Round_Start {
        Round:number;//大回合数
    }

    export interface Action_Start{
        Action:number;//大回合中第x个行动
        ActionData:Array<any>;//行动数据数据
    }

    // 每个action返回的结构[[谁]，[[对哪些人]]，[做了什么],[[结果1],[结果2]]]
    export interface Attack_Start{
        Who:[number/**阵营*/,number/*孔位*/]
        Attack:any;//攻击action
        Result:any;//结果action
    }

    //飘血相关
    export interface Blood_Change{
        PrefabNode:Node;
        Data:FightActionData;
    }

    // 攻击action(攻击描述)
    export namespace FightAttackActionDataType{
        //攻击描述
        export interface Action_Skill{
            Attack:[
                    number/*attack action id*/,
                    number,/*skill_id/buffer_id*/
                    [number/**阵营*/,number/*孔位*/]//对谁做了什么(如果全体技能，可以为空)
            ];
        }
    }

    // 结果action(结果描述)
    export namespace FightResultActionDataType{
        // hp 变化
        export interface Action_HP{
            Result:[
                        number/*result action id*/,
                        number/*阵营*/,
                        [
                            [number/*孔位*/,[number/*hp type*/,number/*result*/]]
                        ]
                    ]
        }
    }
}
