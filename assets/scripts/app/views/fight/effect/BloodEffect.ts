import { EffectBase } from "./EffectBase"

import { _decorator, Component, Node, Label, Animation, log, AnimationComponent } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('BloodEffect')
export class BloodEffect extends EffectBase {
    
    static BloodType = {
        Hurt:0,//伤害
        Double:1//连击
    }
    
    @property(Label)
    lblblood:Label = null;

    private _bloodType:number = BloodEffect.BloodType.Hurt;

    start(){

    }

    /**
     * 
     * @param bloodType 设置类型
     */
    public setType(bloodType:number){
        this._bloodType = bloodType;
    }

    /**
     * 
     * @param num number 数字
     */
    public setNumber(num:number) {
        this.lblblood.setString(num.toString());
    }

    public show(){
        let com = this.getComponent(AnimationComponent);
        com.play(this._getAnimationClipName());
    }

    private _getAnimationClipName():string {
        if (this._bloodType == BloodEffect.BloodType.Hurt) {
            return "numbers_crit";
        }else if (this._bloodType == BloodEffect.BloodType.Double) {
            return "numbers_double";
        }
    }
}