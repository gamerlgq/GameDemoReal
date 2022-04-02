/*
 * @Author: liuguoqing
 * @Date: 2022-03-04 23:09:26
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-06 15:24:31
 * @Description: file content
 */
import { error, log } from "cc";
import { Singleton } from "../../framework/components/Singleton";
import { dataMgr } from "../../framework/data/DataMgr";
import { Test_Parser } from "../parser/Test_Parser";

export class DataRegisterMgr extends Singleton{
    DataType = {
        /**
         * @param [0] data handler name:"Test";
         * @param [1] data path:"Raw/map/buff_card";
         * @param [2] array<number>:"[0,100]" //[file start index,file ended index] 例如:genral_0 ~ genral_100(加载101个武将配置); 默认值[]
         * @param [3] parser new xxx_parser() //多语言解析器;
         */
        Test:["Test","test/datas/test",[],new Test_Parser()],
        Translate:["Translate","translate/data/translate",[]],
        FightSkill:["FightSkill","fight/datas/skill/skill_",[1,2]],
        FightHit:["FightHit","fight/datas/hit/hit_",[1,2]],
        FightEmbattled:["FightEmbattled","fight/datas/embattled/embattled_",[1,1]],
        MaincityPreload:["MaincityPreload","maincity/datas/preload",[]]
    }

    loadAllData(doneFunc: () => void) {
        let startTS = new Date().getMilliseconds();
        let length = Object.keys(this.DataType).length;
        for (const key in this.DataType) {
            if (Object.prototype.hasOwnProperty.call(this.DataType, key)) {
                const value = this.DataType[key];
                let dataHandlerName = value[0];
                let path = value[1];
                let pair = value[2];
                let parser = value[3];
                dataMgr.registerDataFile(dataHandlerName,path,parser);
                dataMgr.loadData(dataHandlerName,pair,(isDone:boolean)=>{
                    if (!isDone) {
                        error("DataRegisterMgr loadData error:[ %s ]",dataHandlerName);
                    }
                    length--;
                    if (length == 0){
                        if (doneFunc) {
                            let endTS = new Date().getMilliseconds();
                            log("Load all date file cost [ %s ]ms",endTS - startTS);
                            doneFunc();
                        }
                    }
                })     
            }
        }
    }

    clear(){
        dataRegisterMgr = null;
    }
}

// ()();
export let dataRegisterMgr = (()=>{
    return DataRegisterMgr.getInstance<DataRegisterMgr>();
})();