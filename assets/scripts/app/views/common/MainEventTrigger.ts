
import { _decorator, Component, Node } from 'cc';
import { ComponentBase } from '../../../framework/ui/ComponentBase';
const { ccclass, property,disallowMultiple } = _decorator;

/**
 * Predefined variables
 * Name = MainEventTriier
 * DateTime = Tue Mar 22 2022 16:53:08 GMT+0800 (中国标准时间)
 * Author = maikx123456
 * FileBasename = MainEventTriier.ts
 * FileBasenameNoExtension = MainEventTriier
 * URL = db://assets/scripts/app/views/common/MainEventTriier.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 * 全局事件触发注册写在这里
 */
 
@ccclass('MainEventTrigger')
@disallowMultiple(true)
export class MainEventTrigger extends ComponentBase {
    start () {
        super.start()
    }

    //销毁事件
    onDestroy () {
        super.onDestroy()
    }

}

/**
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
