import { error, find, log, resources, warn } from "cc";
import { Protocol } from "../../app/define/Protocol";
import { gameMgr } from "../core/GameMgr";
import { socketMgr } from "../net/SocketMgr";
import Logger from "../utils/Logger";
import { EN } from "./code/en";
import { ZH } from "./code/zh";

const LANGUAGE_ZH = "zh";
const LANGUAGE_EN = "en";

export class LanguageManager {
    private _support: Array<string> = ["zh", "en"];        // 支持的语言
    private _curLanguage:string = LANGUAGE_ZH
    /** 设置多语言系统支持哪些语种 */
    public set supportLanguages(supportLanguages: Array<string>) {
        this._support = supportLanguages;
    }

    
    getCodeLangFile() {
        if (this.current == LANGUAGE_ZH) {
            return ZH
        }
        else if (this.current == LANGUAGE_EN) {
            return EN
        }
    }

    getStringByIDStr(idStr:string):string {
        let codeLang = this.getCodeLangFile()
        let keys = idStr.split(".")

        let out
        for (let index = 0; index < keys.length; index++) {
            const element = keys[index];

            if (out) {
                out = out[element]
            }
            else {
                out = codeLang[element]
            }
        }

        if (typeof(out) != "string") {
            Logger.e("getStringByIDStr() - error type:" + keys)
        }
        return out
    }

    /**
     * 获取当前语种
     */
    public get current(): string {
        return this._curLanguage
    }

    /**
     * 获取支持的多语种数组
     */
    public get languages(): string[] {
        return this._support;
    }

    public isExist(lang: string): boolean {
        return this.languages.indexOf(lang) > -1;
    }

    
    // /**
    //  * 改变语种，会自动下载对应的语种，下载完成回调
    //  * @param language 
    //  */
    // public setLanguage(language: string, callback: (success: boolean) => void) {
    //     if (!language) {
    //         language = DEFAULT_LANGUAGE;
    //     }
    //     language = language.toLowerCase();
    //     let index = this.languages.indexOf(language);
    //     if (index < 0) {
    //         warn("当前不支持该语种" + language + " 将自动切换到 zh 语种!");
    //         language = DEFAULT_LANGUAGE;
    //     }
    //     if (language === LanguageData.current) {
    //         callback(false);
    //         return;
    //     }

    //     this.loadLanguageAssets(language, (err: any, lang: string) => {
    //         if (err) {
    //             error("语言资源包下载失败", err);
    //             callback(false);
    //             return;
    //         }

    //         Logger.i(`当前语言为【${language}】`);
    //         LanguageData.current = language;
    //         // this._languagePack.updateLanguage(language);

    //         socketMgr.sendInnerMsg(Protocol.Inner.LanguageChange, language)
    //         // if (Editor.EditMode) {
    //         //     find("Canvas").getComponentsInChildren(langua)
    //         // }
    //         // else {
    //         // }
    //         callback(true);
    //     });
    // }

    // /**
    //  * 设置多语言资源目录
    //  * @param langjsonPath 多语言json目录
    //  * @param langTexturePath 多语言图片目录
    //  */
    // public setAssetsPath(langjsonPath: string, langTexturePath: string) {
    //     this._languagePack.setAssetsPath(langjsonPath, langTexturePath);
    // }

    // /**
    //  * 根据data获取对应语种的字符
    //  * @param labId 
    //  * @param arr 
    //  */
    // public getLangByID(labId: string): string {
    //     let yy = {};
    //     let keys = labId.split(".");
    //     keys.forEach(key => {
    //         yy[key];
    //     });

    //     if (!this._isInit) {
    //         this._isInit = true
    //         this.setLanguage(DEFAULT_LANGUAGE,()=>{})
    //     }
    //     return LanguageData.getLangByID(labId);
    // }

    // /**
    //  * 下载语言包素材资源
    //  * 包括语言json配置和语言纹理包
    //  * @param lang 
    //  * @param callback 
    //  */
    // public loadLanguageAssets(lang: string, callback: Function) {
    //     lang = lang.toLowerCase();
    //     return this._languagePack.loadLanguageAssets(lang, callback);
    // }

    // /**
    //  * 释放不需要的语言包资源
    //  * @param lang 
    //  */
    // public releaseLanguageAssets(lang: string) {
    //     lang = lang.toLowerCase();
    //     this._languagePack.releaseLanguageAssets(lang);
    //     socketMgr.sendInnerMsg(Protocol.Inner.LanguageRelease, lang)
    // }
}

export let languageManager = new LanguageManager;