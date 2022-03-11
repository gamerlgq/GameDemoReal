
import { _decorator, Component, Node, find, log } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = MainCityLayer
 * DateTime = Tue Mar 08 2022 14:26:57 GMT+0800 (中国标准时间)
 * Author = Steven_Greeard
 * FileBasename = MainCityLayer.ts
 * FileBasenameNoExtension = MainCityLayer
 * URL = db://assets/scripts/app/views/maincity/MainCityLayer.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('MainCityLayer')
export class MainCityLayer extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    start () {
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
