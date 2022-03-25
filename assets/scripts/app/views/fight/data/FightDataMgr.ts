/*
 * @Author: liuguoqing
 * @Date: 2022-03-19 11:17:19
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-20 23:09:19
 * @Description: file content
 */
import { JsonAsset } from "cc";
import { Singleton } from "../../../../framework/components/Singleton";
import { FightDataBase } from "./FightDataBase";

const Parse = <T extends typeof FightDataBase>(report:JsonAsset,clas:T) => 
        new clas(report) as InstanceType<T>;

export let fightDataMgr:FightDataMgr = null;

export class FightDataMgr extends Singleton{

    private _reportData:any;
    
    public static init(){
        fightDataMgr = FightDataMgr.getInstance<FightDataMgr>();
    }
    
    /**
     * @description 解析战报
     * @param data 战报数据
     */
    public parse<T extends typeof FightDataBase>(report:JsonAsset,clas:T,isNotCache?:boolean):InstanceType<T>{
        let rp = Parse(report,clas);
        // 默认缓存
        if (!isNotCache){
            this._reportData = rp;
            this._reportData as InstanceType<T>;
        }
        return rp
    }

    /**
     * 
     * @param clas T extends typeof FightDataBase
     * @returns intstances of clas
     */
    public getFightData<T extends typeof FightDataBase>(clas:T):InstanceType<T> {
        return this._reportData;
    }

    public destory(){
        FightDataMgr.destoryInstance();
    }

    public clear() {
        fightDataMgr = null;
    }
}