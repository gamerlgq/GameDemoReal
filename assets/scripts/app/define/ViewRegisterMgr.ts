/*
 * @Author: liuguoqing
 * @Date: 2022-03-03 20:51:02
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-04 23:37:27
 * @Description: file content
 */

import { Singleton } from "../../framework/components/Singleton";
import { DialogCreator } from "../views/dialog/Creator";
import { LoginCreator } from "../views/login/Creator";
import { PreRewardCreator } from "../views/pre_reward/Creator";
import { MainCityCreator } from "../views/maincity/Creator";
import { ShowBackgroundMgr } from "./define";
import { viewCreatorMgr } from "../../framework/ui/ViewCreatorManager";
import { FightCreator } from "../views/fight/Creator";
import { FormationCreator } from "../views/formation/Creator";
import { yy } from "./YYNamespace";
import { ViewInfoType } from "./ConfigType";
import { LoadingCreator } from "../views/loading/Creator";
import ChatCreator from "../views/chat/Creator";
import { log } from "cc";
import { G } from "../common/GlobalFunction";

type ViewConfig = {
    path: string;//预制体路径
    isShowBg?: boolean;//是否显示背景(默认false不现实背景)
    isCache?: boolean;//是否永久缓存(默认false不永久缓存) 手动管理是否释放
    batch?:Array<number>;//批量资源例如 hero_1 ~ helr_xx [1,xx];
}

interface ViewRegMgrInterface {
    ViewType: {
        [x: string]: {
            prefab: {
                [y: string]: ViewConfig
            }
        }
    };
}


export class ViewRegisterMgr extends Singleton implements ViewRegMgrInterface {
  
    // 注册预页面预制体路径
    ViewType = {
        // 通用ui
        commonUI: {
            prefab: {
                "RewardItemIcon": {
                    path: "common_ui/prefabs/RewardItemIcon",
                    isCache: true
                },
                "netloading": {
                    path: "common_ui/prefabs/netinstable",
                    isCache: true
                },
                "TouchEffect": {
                    path: "common_ui/prefabs/TouchEffect",
                    isCache: true
                }
            }
        },

        // 登陆
        login: {
            prefab: {
                "LoginView": {
                    path: 'core/prefab/LoginView',
                    isShowBg: true,
                },
                "AccountView": {
                    path: 'core/prefab/AccountView',
                    isShowBg: true,
                },
                "LoginLayer": {
                                path:'login/prefabs/loginlayer',
                            },
                "LoginAccountLayer":{
                                path:'login/prefabs/loginaccount',
                                isShowBg:true,
                            },
                "UserAgreementLayer":{
                                path:"",
                                isShowBg:true,
                },
                "PrivacyPolicyLayer":{
                                path:"",
                                isShowBg:true,
                },
                "NoticeView":{
                    path:"login/prefabs/noticeview",
                    isShowBg:true,
                }
            },
        },

        // dialog/tips
        dialog: {
            prefab: {
                "DoubleBtnDialog": {
                    path: 'common_ui/prefabs/double_btn_dialog',
                    isShowBg: true,
                    isCache: true
                },
                "Tips": {
                    path: "common_ui/prefabs/tips",
                    isShowBg: true,
                    isCache: true
                }
            }
        },

        preReward: {
            prefab: {
                "preRewardMain": {
                    path: "preview_reward/prefabs/preview_reward_prefab",
                    isShowBg: true,
                }
            }
        },

        // 主城
        maincity: {
            prefab: {
                "MainCityLayer": {
                    path: "maincity/prefabs/maincitylayer",
                    isCache: true
                },
                "MainCityUI": {
                    path: "maincity/prefabs/maincityui",
                    isCache: true
                }
            }
        },

        // 战斗
        fight: {
            prefab: {
                "FightMainLayer": {
                    path: "fight/prefabs/changjing/mainfightlayer"
                },
                "FightMainUI": {
                    path: "fight/prefabs/changjing/mainfightui"
                },
                "FightEditorUI": {
                    path: "fight/prefabs/changjing/fighteditorui"
                },
                "FightFormation": {
                    path: "fight/prefabs/changjing/FightFormation"
                }
            }
        },

        // 武将
        hero: {
            prefab: {
                "HeroSpinePrefab": {
                    path: "hero/prefabs/hero/hero_",
                    batch:[1,3]
                }
            }
        },
        //布阵
        formation: {
            prefab: {
                "FormationView": {
                    path: "formation/prefabs/formation"
                }
            }
        },
        // loading
        loading:{
            prefab:{
                "ResLoadingLayer":{
                    path:"loading/prefabs/resloadinglayer",
                    isCache: true
                },
                "TransLoadingLayer":{
                    path:"loading/prefabs/transloadinglayer",
                    isCache: true
                },
            }
        },

        chat:{
            prefab:{
                "ChatLayer":{
                    path:"chat/prefabs/ChatLayer",
                    isShowBg: true,
                }
            }
        }
    }

    // 注册各个系统的预制体
    Cretors = [
        LoginCreator,
        DialogCreator,
        PreRewardCreator,
        MainCityCreator,
        FightCreator,
        FormationCreator,
        LoadingCreator,
        ChatCreator,
    ]

    private constructor() {
        super();
        Object.keys(this.ViewType).forEach((system: string) => {
            // log("ViewRegisterMgr:ctor() system [ %s ]",system);
            let module = this.ViewType[system];
            Object.keys(module.prefab).forEach((view: string) => {
                let arr = <ViewConfig>module.prefab[<string><unknown>view];
                let isHidden = arr.isShowBg ?? false;
                // log("ViewRegisterMgr:ctor() view [ %s ] [ %s ]",view,isHidden.toString());
                if (isHidden) {
                    ShowBackgroundMgr.regShowBackgroundView(view);
                }
            })
        })
    }

    // 在编辑器中右键添加resources下的预加载资源,自动保存到maincity/datas/preload.json文件中
    getMaincityPreloadList():Array<string>{
        let list:Array<string> = new Array();
        let config = G.getConfig("MaincityPreload");
        if (config){
            const keys = Object.keys(config);
            keys.forEach(key=>{
                let pair:Array<string>=new Array();
                list.push(key);
            })
        }
        return list;
    }


    // 各个系统中获取页面预制的都路径 返回 ViewInfoType
    getViewInfo<TMoudleName extends yy.types.ViewModuleName,
        TPrefabName = keyof ViewRegisterMgr['ViewType'][TMoudleName]['prefab']>
        (name: TMoudleName, prefabName: yy.types.NoInfer<TPrefabName>): ViewInfoType {
        let module = this.ViewType[name];
        let cfg = <ViewConfig>module.prefab[<string><unknown>prefabName];
        return {
            System: name,
            View: <string><unknown>prefabName,
            Path: cfg.path,
            Hidden: cfg.isShowBg ?? false,
            Cache: cfg.isCache ?? false
        };
    }

    // enter app call this method,register all view creator
    public registerAllCreator() {
        this.Cretors.forEach((ctor) => {
            viewCreatorMgr.registeredCreator(new ctor());
        })
    }

    clear(){
        viewRegisterMgr = null
    }
}

// ()();
export let viewRegisterMgr = (() => {
    return ViewRegisterMgr.getInstance<ViewRegisterMgr>();
})();