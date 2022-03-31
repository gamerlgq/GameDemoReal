import { Camera, director, find, game, input, log, sys } from "cc";
import { singletonMgr } from "../framework/components/SingletonMgr";
import { audioMgr } from "../framework/core/audio/AudioManager";
import { gameMgr } from "../framework/core/GameMgr";
import { sceneMgr } from "../framework/core/SceneMgr";
import { languageManager, LanguageManager } from "../framework/language/Language";
import { netLoadingMgr } from "../framework/net/NetLoadingMgr";
import { translateMgr } from "../framework/translate/TranslateMgr";
import { GameConfig } from "../GameConfig";
import { dataRegisterMgr } from "./define/DataRegisterMgr";
import { ViewProtocol } from "./define/ViewProtocol";
import { viewRegisterMgr } from "./define/ViewRegisterMgr";
import { modelRegisterMgr } from "./model/ModelRegisterMgr";

/*
 * @Author: liuguoqing
 * @Date: 2022-03-02 16:36:11
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-02 18:00:01
 * @Description: file content
 */
export class EnterApp {
    constructor() {
        this.run();
    }

    run() {
        this.init();
        this.loadDefine();
        this.loadAllDataFile();
        this.initSDKHelper();
    }

    reRun() {
        singletonMgr.destoryAll();
        let scene = director.getScene();
        audioMgr.stopAll()
        // let main = scene.getComponentInChildren("Main");
        // gameMgr.setCamera("default", main.defaultCamera);
        // gameMgr.setCamera("fight", main.fightCamera);
        // this.run();
        director.loadScene("HotUpdate");
    }

    init() {
        sceneMgr.init();
        gameMgr.setApp(this);
        audioMgr.init();
        netLoadingMgr.init()
        //玩家ID，保存音效设置
        // audioMgr.setUuid("3998857")

        let uiCamera = find("Canvas")?.getChildByName("UICamera")?.getComponent(Camera);
        gameMgr.setCamera("UICamera",uiCamera);

        let fightCamera = find("Canvas")?.getChildByName("MainCamera")?.getComponent(Camera);
        gameMgr.setCamera("MainCamera",fightCamera);
    }

    loadDefine() {
        viewRegisterMgr.registerAllCreator();
    }

    loadAllDataFile() {
        log("loading config..");
        // logDot(DotIDS.configLoadingStart);
        dataRegisterMgr.loadAllData(() => {
            log("loading config is done");
            // logDot(DotIDS.configLoadingFinish);
            this.loadAllModel();
            this.loadAllRedGuide();
            this.done();
        });
    }

    loadAllRedGuide() {
        // RedGuideReg.loadAllRedGuide();
    }

    loadAllModel() {
        modelRegisterMgr.loadAllModel();
    }

    done() {
        // if (cc.sys.isMobile) {
        //     cc.macro.ENABLE_MULTI_TOUCH = false;
        // }
        
        game.frameRate = 60;
        input.setAccelerometerEnabled(true);
        log("进入游戏");
        
        sceneMgr.sendCreateView(ViewProtocol.LoginLayer);
    }

    initSDKHelper() {
        let SDKHelper;
        if (sys.isNative && GameConfig.SDKLogin) {
            if (sys.os == sys.OS.IOS) {
        //         let content = require("../SDK/SDKIosHelper");
        //         SDKHelper = content.SDKHelper;
        //         window["SDKHelper"] = SDKHelper.getInstance();
            } else if (sys.os == sys.OS.ANDROID) {
        //         let content = require("../SDK/SDKAndroidHelper");
        //         SDKHelper = content.SDKHelper;
        //         window["SDKHelper"] = SDKHelper.getInstance();
        //         window["SDKHelper"].SDKInit();
            }
        }
    }
}