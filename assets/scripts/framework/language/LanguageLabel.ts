/**
 * 所有文本用这一个组件,用于多语言切换
 */
import { CCString, Component, Enum, error, Label, log, RichText, warn, _decorator } from "cc";
import { EDITOR } from "cc/env";
import { Protocol } from "../../app/define/Protocol";
import { ComponentBase } from "../ui/ComponentBase";
import { languageManager } from "./Language";

const { ccclass, property, menu, executeInEditMode} = _decorator;

@ccclass("LangLabelParamsItem")
export class LangLabelParamsItem {
    @property
    key: string = "";
    @property
    value: string = "";
}

@ccclass("LanguageLabel")
@executeInEditMode
@menu('ui/language/LanguageLabel')
export class LanguageLabel extends ComponentBase {
    @property({
        type: LangLabelParamsItem,
        displayName: "params"
    })
    private _params: Array<LangLabelParamsItem> = [];

    @property({
        type: LangLabelParamsItem,
        displayName: "params"
    })
    set params(value: Array<LangLabelParamsItem>) {
        this._params = value;
    }
    get params(): Array<LangLabelParamsItem> {
        return this._params || [];
    }

    @property({ serializable: true })
    private _dataID: string = "";
    @property({ type: CCString, serializable: true })
    get dataID(): string {
        return this._dataID || "";
    }
    set dataID(value: string) {
        this._dataID = value;
        this.string = languageManager.getStringByIDStr(value)
    }

    // onEnable() {
    //     if (EDITOR) {
    //         this._updateLabel();
    //     }
    // }

    private _string:string = ""
    set string(str:string) {
        this._string = str
        this._updateLabel()
    }

    get string(): string {
        let _string = this._string
        if (_string && this._params.length > 0) {
            this._params.forEach((item: LangLabelParamsItem) => {
                _string = _string.replace(`%{${item.key}}`, item.value)
            })
        }
        return _string;
    }

    private _updateLabel() {
        do {
            let spcomp: any = this.getComponent(Label);
            if (!spcomp) {
                spcomp = this.getComponent(RichText);
                if (!spcomp) {
                    warn("[LanguageLabel], 该节点没有cc.Label || cc.RichText组件");
                    break;
                }
            }

            spcomp.string = this.string
        }
        while (false);
    }

    
    initFontSize: number = 0;

    onLoad() {
        super.onLoad();

        //暂不做动态变换
        // this.addMsgListener(Protocol.Inner.LanguageChange, this.onLanguageChange.bind(this))

        // this._needUpdate = true;
        if (!this.getComponent(Label) && !this.getComponent(RichText)) {
            error(this.node.name, this._dataID);
            return;
        }

        if (this.getComponent(RichText)) {
            this.initFontSize = this.getComponent(RichText)!.fontSize;
        }

        if (this.getComponent(Label)) {
            this.initFontSize = this.getComponent(Label)!.fontSize;
        }
    }

    /**
     * 默认文本的系统字体名字
     */
    public getLabelFont(lang: string): string {
        switch (lang) {
            case "zh":
            case "tr": {
                return "SimHei";
            }
        }
        return "Helvetica";
    }

    /**
     * 修改多语言参数，采用惰性求值策略
     * @param key 对于i18n表里面的key值
     * @param value 替换的文本
     */
    setVars(key: string, value: string) {
        let haskey = false;
        for (let i = 0; i < this._params.length; i++) {
            let element: LangLabelParamsItem = this._params[i];
            if (element.key === key) {
                element.value = value;
                haskey = true;
            }
        }
        if (!haskey) {
            let ii = new LangLabelParamsItem();
            ii.key = key;
            ii.value = value;
            this._params.push(ii);
        }
    }

    update() {
        // if (this._needUpdate) {
        //     this.updateLabel();
        //     this._needUpdate = false;
        // }
    }
}
